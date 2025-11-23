const Video = require("../models/Video");
const User = require("../models/User");
const youtubeService = require("../services/youtubeService");

exports.getVideos = async (req, res) => {
  try {
    const { channel } = req.params;
    const { sortBy = "recent", limit = 20, page = 1 } = req.query;

    console.log(
      `📥 getVideos - Channel: ${channel}, Sort: ${sortBy}, Page: ${page}`
    );

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const query = channel === "all" ? {} : { channel };

    let sort;
    if (sortBy === "popular") {
      sort = { views: -1, publishedAt: -1 };
    } else {
      sort = { publishedAt: -1, views: -1 };
    }

    const videos = await Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalCount = await Video.countDocuments(query);
    const hasMore = totalCount > skip + videos.length;

    console.log(`   ✅ Found ${videos.length} videos, Total: ${totalCount}`);

    res.json({
      success: true,
      count: videos.length,
      total: totalCount,
      page: pageNum,
      hasMore: hasMore,
      data: videos,
    });
  } catch (error) {
    console.error("❌ getVideos error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refreshVideos = async (req, res) => {
  try {
    const { channel } = req.body;
    const userId = req.userId; // From auth middleware

    // Get user's API key
    const user = await User.findById(userId);
    const userApiKey = user?.youtubeApiKey;

    if (!userApiKey) {
      return res.status(400).json({
        success: false,
        message:
          "YouTube API key is missing. Please update your API key in settings.",
        needsApiKey: true,
      });
    }

    const channels = channel ? [channel] : ["ted", "teded", "tedx"];

    console.log(`🔄 Refreshing videos for ${user.username}...`);
    console.log(`   Using ${userApiKey ? "user's" : "default"} API key`);
    console.log(`   Channels: ${channels.join(", ")}`);

    let totalUpdated = 0;

    for (const ch of channels) {
      try {
        // Use user's API key if available
        const videos = await youtubeService.fetchAllChannelVideos(
          ch,
          0,
          userApiKey
        );

        console.log(`   Processing ${videos.length} videos for ${ch}...`);

        for (const video of videos) {
          await Video.findOneAndUpdate(
            { youtubeId: video.youtubeId },
            { ...video, lastUpdated: new Date() },
            { upsert: true, new: true }
          );
          totalUpdated++;
        }

        console.log(`   ✅ ${ch}: ${videos.length} videos updated`);
      } catch (error) {
        console.error(`   ❌ Failed to update ${ch}:`, error.message);

        // If it's an API key error, inform the user
        if (error.response?.status === 403 || error.response?.status === 400) {
          return res.status(400).json({
            success: false,
            message: `YouTube API error: ${error.message}. Please check your API key.`,
            apiKeyError: true,
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${totalUpdated} videos`,
      channels: channels,
      usedUserApiKey: !!userApiKey,
    });
  } catch (error) {
    console.error("❌ refreshVideos error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
