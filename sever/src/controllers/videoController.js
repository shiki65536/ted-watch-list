const Video = require("../models/Video");
const youtubeService = require("../services/youtubeService");

exports.getVideos = async (req, res) => {
  try {
    const { channel } = req.params;
    const { sortBy = "recent", limit = 20, page = 1 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = channel === "all" ? {} : { channel };

    // Build sort
    const sort = sortBy === "popular" ? { views: -1 } : { publishedAt: -1 };

    // Execute query with pagination
    const videos = await Video.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Check if there are more videos
    const totalCount = await Video.countDocuments(query);
    const hasMore = totalCount > skip + videos.length;

    res.json({
      success: true,
      count: videos.length,
      total: totalCount,
      page: pageNum,
      hasMore: hasMore,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refreshVideos = async (req, res) => {
  try {
    const { channel } = req.body;
    const channels = channel ? [channel] : ["ted", "teded", "tedx"];

    let totalUpdated = 0;

    for (const ch of channels) {
      // Fetch 150 recent + 300 popular
      const recentVideos = await youtubeService.fetchChannelVideosDeep(
        ch,
        150,
        "date"
      );
      const popularVideos = await youtubeService.fetchChannelVideosDeep(
        ch,
        300,
        "viewCount"
      );

      const allVideos = [...recentVideos, ...popularVideos];
      const uniqueVideos = Array.from(
        new Map(allVideos.map((v) => [v.youtubeId, v])).values()
      );

      for (const video of uniqueVideos) {
        await Video.findOneAndUpdate(
          { youtubeId: video.youtubeId },
          { ...video, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
        totalUpdated++;
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${totalUpdated} videos`,
      channels: channels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
