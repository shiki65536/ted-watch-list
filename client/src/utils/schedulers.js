const cron = require("node-cron");
const youtubeService = require("../services/youtubeService");
const Video = require("../models/Video");

const updateVideos = async () => {
  console.log("🔄 Starting scheduled video update...");

  try {
    const channels = ["ted", "teded", "tedx"];

    for (const channel of channels) {
      // Fetch recent videos (50 most recent)
      const recentVideos = await youtubeService.fetchChannelVideos(
        channel,
        50,
        "date"
      );

      // Fetch popular videos (50 most popular by view count)
      const popularVideos = await youtubeService.fetchChannelVideos(
        channel,
        50,
        "viewCount"
      );

      // Combine and remove duplicates
      const allVideos = [...recentVideos, ...popularVideos];
      const uniqueVideos = Array.from(
        new Map(allVideos.map((v) => [v.youtubeId, v])).values()
      );

      // Update database
      for (const video of uniqueVideos) {
        await Video.findOneAndUpdate(
          { youtubeId: video.youtubeId },
          { ...video, lastUpdated: new Date() },
          { upsert: true, new: true }
        );
      }

      console.log(
        `✅ Updated ${channel} videos (${uniqueVideos.length} total)`
      );
    }

    console.log("✅ Scheduled update completed");
  } catch (error) {
    console.error("❌ Scheduled update failed:", error.message);
  }
};

const startScheduler = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", updateVideos);
  console.log("⏰ Scheduler started - Updates every 6 hours");

  // Run immediately on startup
  updateVideos();
};

module.exports = { startScheduler, updateVideos };
