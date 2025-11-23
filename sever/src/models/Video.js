const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    youtubeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      enum: ["ted", "teded", "tedx"],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    thumbnail: {
      default: String,
      medium: String,
      high: String,
    },
    duration: String,
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    tags: [String],
    channelTitle: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);
