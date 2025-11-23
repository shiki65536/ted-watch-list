const cron = require("node-cron");
const youtubeService = require("../services/youtubeService");
const Video = require("../models/Video");

/**
 * Update strategy configuration
 * TED & TED-Ed: Full sync (all videos)
 * TEDx: Limited sync (too many videos, 200k+)
 */
const UPDATE_CONFIG = {
  ted: {
    strategy: "full", // Get ALL videos
    limit: 0, // 0 = unlimited
  },
  teded: {
    strategy: "full", // Get ALL videos
    limit: 0,
  },
  tedx: {
    strategy: "limited", // Limit to prevent overwhelming
    limit: 5000, // Only get 5000 most recent/popular
  },
};

const updateVideos = async () => {
  console.log("\n" + "=".repeat(70));
  console.log("🔄 STARTING VIDEO UPDATE - FULL SYNC MODE");
  console.log("⏰ Time:", new Date().toLocaleString());
  console.log("=".repeat(70));

  try {
    const channels = ["ted", "teded", "tedx"];
    let totalUpdated = 0;
    let totalCreated = 0;

    for (const channel of channels) {
      const config = UPDATE_CONFIG[channel];

      console.log(`\n${"*".repeat(70)}`);
      console.log(
        `📺 Processing ${channel.toUpperCase()} (${config.strategy} sync)`
      );
      console.log("*".repeat(70));

      let videos = [];

      if (config.strategy === "full") {
        // Full sync using Uploads Playlist (SUPER EFFICIENT)
        console.log(
          `🎯 Strategy: Fetch ALL videos from ${channel.toUpperCase()}`
        );
        videos = await youtubeService.fetchAllChannelVideos(
          channel,
          config.limit
        );
      } else {
        // Limited sync for channels with too many videos (TEDx)
        console.log(`🎯 Strategy: Limited sync (${config.limit} videos)`);
        console.log(`   Fetching recent and popular videos...`);

        // Get mix of recent and popular
        const recent = await youtubeService.fetchChannelVideosDeep(
          channel,
          config.limit / 2,
          "date"
        );
        const popular = await youtubeService.fetchChannelVideosDeep(
          channel,
          config.limit / 2,
          "viewCount"
        );

        // Merge and deduplicate
        const combined = [...recent, ...popular];
        const uniqueMap = new Map(combined.map((v) => [v.youtubeId, v]));
        videos = Array.from(uniqueMap.values());
      }

      console.log(`\n💾 Saving ${videos.length} videos to database...`);

      // Update database
      let channelUpdated = 0;
      let channelCreated = 0;
      let progress = 0;
      const progressInterval = Math.floor(videos.length / 10) || 1;

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];

        const result = await Video.findOneAndUpdate(
          { youtubeId: video.youtubeId },
          { ...video, lastUpdated: new Date() },
          { upsert: true, new: true, rawResult: true }
        );

        if (result.lastErrorObject?.updatedExisting) {
          channelUpdated++;
        } else {
          channelCreated++;
        }

        // Progress indicator
        if ((i + 1) % progressInterval === 0 || i === videos.length - 1) {
          progress = Math.round(((i + 1) / videos.length) * 100);
          console.log(`   Progress: ${progress}% (${i + 1}/${videos.length})`);
        }
      }

      totalUpdated += channelUpdated;
      totalCreated += channelCreated;

      // Channel statistics
      const dbCount = await Video.countDocuments({ channel });
      const topVideo = await Video.findOne({ channel }).sort({ views: -1 });

      console.log(`\n📊 ${channel.toUpperCase()} Results:`);
      console.log(`   ✅ Created: ${channelCreated} new videos`);
      console.log(`   🔄 Updated: ${channelUpdated} existing videos`);
      console.log(`   💾 Total in DB: ${dbCount} videos`);

      if (topVideo) {
        console.log(
          `   🏆 Most popular: "${topVideo.title.substring(0, 50)}..."`
        );
        console.log(`      Views: ${topVideo.views.toLocaleString()}`);
      }
    }

    // Final statistics
    console.log(`\n${"=".repeat(70)}`);
    console.log("📊 FINAL STATISTICS");
    console.log("=".repeat(70));

    const allStats = await Promise.all(
      channels.map(async (ch) => {
        const count = await Video.countDocuments({ channel: ch });
        const mostPopular = await Video.findOne({ channel: ch }).sort({
          views: -1,
        });
        const mostRecent = await Video.findOne({ channel: ch }).sort({
          publishedAt: -1,
        });

        return {
          channel: ch.toUpperCase(),
          count,
          topVideo: mostPopular?.title.substring(0, 40) || "N/A",
          topViews: mostPopular?.views || 0,
          latestVideo: mostRecent?.title.substring(0, 40) || "N/A",
          latestDate: mostRecent?.publishedAt,
        };
      })
    );

    allStats.forEach((stat) => {
      console.log(`\n${stat.channel}:`);
      console.log(`  📚 Total videos: ${stat.count.toLocaleString()}`);
      console.log(`  🔥 Most popular: ${stat.topVideo}`);
      console.log(`     └─ ${stat.topViews.toLocaleString()} views`);
      console.log(`  📅 Latest: ${stat.latestVideo}`);
      console.log(
        `     └─ ${
          stat.latestDate
            ? new Date(stat.latestDate).toLocaleDateString()
            : "N/A"
        }`
      );
    });

    const grandTotal = allStats.reduce((sum, s) => sum + s.count, 0);

    console.log(`\n${"=".repeat(70)}`);
    console.log(
      `🎯 GRAND TOTAL: ${grandTotal.toLocaleString()} videos in database`
    );
    console.log(
      `📈 This update: ${totalCreated} created, ${totalUpdated} updated`
    );
    console.log(`✅ Update completed successfully!`);
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ UPDATE FAILED");
    console.error("=".repeat(70));
    console.error("Error:", error.message);
    if (error.response?.data) {
      console.error("API Error Details:", error.response.data);
    }
    console.error("Stack:", error.stack);
    console.error("=".repeat(70) + "\n");
  }
};

const startScheduler = () => {
  // Run every 12 hours (not 6, since we're getting ALL videos now)
  cron.schedule("0 */12 * * *", () => {
    console.log("\n⏰ Scheduled update triggered by cron");
    updateVideos();
  });

  console.log("⏰ Scheduler initialized - Updates every 12 hours");
  console.log("🚀 Starting initial video fetch...");
  console.log("   (This may take 5-10 minutes for full sync)\n");

  // Run immediately on startup
  updateVideos();
};

module.exports = { startScheduler, updateVideos };
