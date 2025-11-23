const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const videoRoutes = require("./src/routes/videos");
const userRoutes = require("./src/routes/users");
const authRoutes = require("./src/routes/auth");
const errorHandler = require("./src/middleware/errorHandler");
const { startScheduler, updateVideos } = require("./src/utils/scheduler");

const app = express();
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "https://i.ytimg.com"],

        "frame-src": [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'", process.env.CLIENT_URL],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api/", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "CORS is working!",
    timestamp: new Date(),
    env: {
      PORT: process.env.PORT,
      CLIENT_URL: process.env.CLIENT_URL,
      MONGODB_CONNECTED: mongoose.connection.readyState === 1,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? "✅ Set" : "❌ Not set",
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });
});

// DEBUG: Check database videos with detailed stats
app.get("/api/debug/videos", async (req, res) => {
  try {
    const Video = require("./src/models/Video");

    const channels = ["ted", "teded", "tedx"];
    const stats = await Promise.all(
      channels.map(async (ch) => {
        const count = await Video.countDocuments({ channel: ch });
        const mostPopular = await Video.findOne({ channel: ch }).sort({
          views: -1,
        });
        const leastPopular = await Video.findOne({ channel: ch }).sort({
          views: 1,
        });
        const mostRecent = await Video.findOne({ channel: ch }).sort({
          publishedAt: -1,
        });
        const oldest = await Video.findOne({ channel: ch }).sort({
          publishedAt: 1,
        });

        return {
          channel: ch.toUpperCase(),
          count,
          popular: {
            top: mostPopular
              ? {
                  title: mostPopular.title.substring(0, 50),
                  views: mostPopular.views.toLocaleString(),
                }
              : null,
            bottom: leastPopular
              ? {
                  title: leastPopular.title.substring(0, 50),
                  views: leastPopular.views.toLocaleString(),
                }
              : null,
          },
          timeline: {
            newest: mostRecent
              ? {
                  title: mostRecent.title.substring(0, 50),
                  date: mostRecent.publishedAt,
                }
              : null,
            oldest: oldest
              ? {
                  title: oldest.title.substring(0, 50),
                  date: oldest.publishedAt,
                }
              : null,
          },
        };
      })
    );

    const total = await Video.countDocuments();

    res.json({
      success: true,
      total,
      channels: stats,
      note: "Use POST /api/debug/force-refresh to update videos",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DEBUG: Test YouTube API
app.get("/api/debug/youtube-test", async (req, res) => {
  const youtubeService = require("./src/services/youtubeService");

  try {
    console.log("🧪 Testing YouTube API...");
    console.log(
      "API Key:",
      process.env.YOUTUBE_API_KEY ? "Set ✅" : "Not Set ❌"
    );

    // Test with TED channel - fetch just 5 videos from playlist
    const videos = await youtubeService.fetchAllChannelVideos("ted", 5);

    console.log(`✅ Successfully fetched ${videos.length} videos`);

    res.json({
      success: true,
      count: videos.length,
      apiKeySet: !!process.env.YOUTUBE_API_KEY,
      method: "Uploads Playlist (Super Efficient)",
      quotaCost: "~1 quota used",
      sample: videos.map((v) => ({
        title: v.title,
        views: v.views.toLocaleString(),
        youtubeId: v.youtubeId,
      })),
    });
  } catch (error) {
    console.error("❌ YouTube API test failed:", error);
    res.json({
      success: false,
      error: error.message,
      apiKeySet: !!process.env.YOUTUBE_API_KEY,
    });
  }
});

// DEBUG: Force refresh videos (FULL SYNC - may take 5-10 minutes)
app.post("/api/debug/force-refresh", async (req, res) => {
  // Send immediate response
  res.json({
    success: true,
    message:
      "Full sync started in background. Check server console for progress.",
    note: "This may take 5-10 minutes. Refresh /api/debug/videos to see progress.",
  });

  // Run in background
  try {
    console.log("🔄 Manual full sync triggered via API");
    await updateVideos();
  } catch (error) {
    console.error("❌ Manual sync failed:", error);
  }
});

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connection success");
    console.log("📊 Database name:", mongoose.connection.name);

    // DON'T start scheduler automatically - let user trigger manually first
    // Uncomment this when you're ready for automatic updates:
    // startScheduler();

    console.log("\n" + "=".repeat(70));
    console.log("🎬 TED MANAGER SERVER READY");
    console.log("=".repeat(70));
    console.log("\n📝 To fetch ALL videos (first time setup):");
    console.log("   POST http://localhost:5001/api/debug/force-refresh");
    console.log("\n📊 To check database status:");
    console.log("   GET http://localhost:5001/api/debug/videos");
    console.log("\n🧪 To test YouTube API:");
    console.log("   GET http://localhost:5001/api/debug/youtube-test");
    console.log("\n⚠️  Note: First sync may take 5-10 minutes");
    console.log("   TED: ~4000 videos");
    console.log("   TED-Ed: ~2000 videos");
    console.log("   TEDx: ~5000 videos (limited)");
    console.log("=".repeat(70) + "\n");
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

const PORT = process.env.PORT || 5001;

const path = require("path");

// Serve React build for any other route (SPA)
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
});

module.exports = app;
