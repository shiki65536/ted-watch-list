const User = require("../models/User");
const Video = require("../models/Video");

exports.getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const videoIds = user.favourites.map((f) => f.videoId);
    const videos = await Video.find({ youtubeId: { $in: videoIds } });

    res.json({
      success: true,
      data: videos,
    });
  } catch (error) {
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

    res.json({ success: true, message: "Added to favourites" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeFavourite = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await User.findById(req.userId);

    user.favourites = user.favourites.filter((f) => f.videoId !== videoId);
    await user.save();

    res.json({ success: true, message: "Removed from favourites" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWatched = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const videoIds = user.watched.map((w) => w.videoId);
    const videos = await Video.find({ youtubeId: { $in: videoIds } });

    res.json({ success: true, data: videos });
  } catch (error) {
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
    }

    res.json({ success: true, message: "Marked as watched" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeWatched = async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await User.findById(req.userId);

    user.watched = user.watched.filter((w) => w.videoId !== videoId);
    await user.save();

    res.json({ success: true, message: "Removed from watched" });
  } catch (error) {
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

    // Query: exclude watched videos, sort by views (popular)
    const query = {
      youtubeId: { $nin: watchedIds },
    };

    const videos = await Video.find(query)
      .sort({ views: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Video.countDocuments(query);
    const hasMore = totalCount > skip + videos.length;

    res.json({
      success: true,
      count: videos.length,
      total: totalCount,
      hasMore: hasMore,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
