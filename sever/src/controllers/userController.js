const User = require("../models/User");
const Video = require("../models/Video");

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const videoIds = user.favourites.map((f) => f.videoId);

    // Fetch videos and sort by views (descending)
    const videos = await Video.find({ youtubeId: { $in: videoIds } }).sort({
      views: -1,
    }); // Sort by most popular first

    console.log(
      `📊 getFavourites - Found ${videos.length} videos, sorted by views`
    );

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
    console.error("❌ getFavourites error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addFavourite = async (req, res) => {
  try {
    const { videoId } = req.body;
    const user = await User.findById(req.userId);

    const exists = user.favourites.some((f) => f.videoId === videoId);
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Already in favourites" });
    }

    user.favourites.push({ videoId });
    await user.save();

    console.log(`➕ Added ${videoId} to favourites`);

    res.json({ success: true, message: "Added to favourites" });
  } catch (error) {
    console.error("❌ addFavourite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavourite = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await User.findById(req.userId);

    user.favourites = user.favourites.filter((f) => f.videoId !== videoId);
    await user.save();

    console.log(`➖ Removed ${videoId} from favourites`);

    res.json({ success: true, message: "Removed from favourites" });
  } catch (error) {
    console.error("❌ removeFavourite error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWatched = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const videoIds = user.watched.map((w) => w.videoId);

    // Fetch videos and sort by views (descending)
    const videos = await Video.find({ youtubeId: { $in: videoIds } }).sort({
      views: -1,
    }); // Sort by most popular first

    console.log(
      `📊 getWatched - Found ${videos.length} videos, sorted by views`
    );

    res.json({ success: true, data: videos });
  } catch (error) {
    console.error("❌ getWatched error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addWatched = async (req, res) => {
  try {
    const { videoId } = req.body;
    const user = await User.findById(req.userId);

    const exists = user.watched.some((w) => w.videoId === videoId);
    if (!exists) {
      user.watched.push({ videoId });
      await user.save();
      console.log(`👁️ Marked ${videoId} as watched`);
    }

    res.json({ success: true, message: "Marked as watched" });
  } catch (error) {
    console.error("❌ addWatched error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeWatched = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await User.findById(req.userId);

    user.watched = user.watched.filter((w) => w.videoId !== videoId);
    await user.save();

    console.log(`🔄 Removed ${videoId} from watched`);

    res.json({ success: true, message: "Removed from watched" });
  } catch (error) {
    console.error("❌ removeWatched error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBucket = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const user = await User.findById(req.userId);
    const watchedIds = user.watched.map((w) => w.videoId);

    // Query: exclude watched videos, sort by views (popular first)
    const query = {
      youtubeId: { $nin: watchedIds },
    };

    const videos = await Video.find(query)
      .sort({ views: -1 }) // Sort by most popular first
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Video.countDocuments(query);
    const hasMore = totalCount > skip + videos.length;

    console.log(
      `📊 getBucket - Page ${pageNum}, Found ${videos.length}/${totalCount} videos, sorted by views`
    );

    res.json({
      success: true,
      count: videos.length,
      total: totalCount,
      hasMore: hasMore,
      data: videos,
    });
  } catch (error) {
    console.error("❌ getBucket error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
