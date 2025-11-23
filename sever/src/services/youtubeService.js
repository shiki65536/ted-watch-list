const axios = require("axios");

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Channel IDs and their Uploads Playlist IDs
// NOTE: These IDs were verified by querying YouTube API
const CHANNELS = {
  ted: {
    channelId: "UCAuUUnT6oDeKwE6v1NGQxug",
    uploadsId: "UUAuUUnT6oDeKwE6v1NGQxug", // Verified ✅
  },
  teded: {
    channelId: "UCsooa4yRKGN_zEE8iknghZA",
    uploadsId: null, // Will be fetched dynamically
  },
  tedx: {
    channelId: "UCsT0YIqwnpJCM-mx7-gSA4Q",
    uploadsId: null, // Will be fetched dynamically
  },
};

class YouTubeService {
  /**
   * Get uploads playlist ID for a channel
   */
  async getUploadsPlaylistId(channelId) {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          key: YOUTUBE_API_KEY,
          id: channelId,
          part: "contentDetails",
        },
      });

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].contentDetails.relatedPlaylists.uploads;
      }

      throw new Error("Channel not found");
    } catch (error) {
      console.error(`Error getting uploads playlist ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch ALL videos from a channel using Uploads Playlist
   * This is the most efficient method (saves 98% quota vs search)
   * @param {string} channel - Channel name (ted, teded, tedx)
   * @param {number} maxVideos - Maximum videos to fetch (0 = unlimited)
   */
  async fetchAllChannelVideos(channel, maxVideos = 0) {
    try {
      const channelData = CHANNELS[channel];

      if (!channelData) {
        throw new Error(`Unknown channel: ${channel}`);
      }

      if (!YOUTUBE_API_KEY) {
        throw new Error("YouTube API key not configured");
      }

      // Get uploads playlist ID (use cached if available, otherwise fetch)
      let uploadsPlaylistId = channelData.uploadsId;

      if (!uploadsPlaylistId) {
        console.log(`   Fetching uploads playlist ID for ${channel}...`);
        uploadsPlaylistId = await this.getUploadsPlaylistId(
          channelData.channelId
        );
        console.log(`   Got playlist ID: ${uploadsPlaylistId}`);
      }

      console.log(`\n${"=".repeat(60)}`);
      console.log(`📺 Fetching ALL videos from ${channel.toUpperCase()}`);
      console.log(`   Channel ID: ${channelData.channelId}`);
      console.log(`   Playlist ID: ${uploadsPlaylistId}`);
      console.log("=".repeat(60));

      // Step 1: Get all video IDs from playlist (SUPER CHEAP - 1 quota per 50 videos)
      const videoIds = await this.fetchPlaylistVideoIds(
        uploadsPlaylistId,
        maxVideos
      );

      console.log(`\n✅ Found ${videoIds.length} videos in playlist`);

      // Step 2: Get detailed info for all videos in batches (1 quota per 50 videos)
      const videos = await this.fetchVideosDetails(videoIds, channel);

      console.log(`✅ Fetched details for ${videos.length} videos`);
      console.log("=".repeat(60));

      return videos;
    } catch (error) {
      console.error(`❌ Error fetching ${channel} videos:`, error.message);
      if (error.response?.data) {
        console.error("API Error:", error.response.data);
      }
      throw error;
    }
  }

  /**
   * Fetch all video IDs from a playlist (paginated)
   * Cost: 1 quota per page (50 videos)
   */
  async fetchPlaylistVideoIds(playlistId, maxVideos = 0) {
    let allVideoIds = [];
    let nextPageToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      console.log(`  📄 Fetching page ${pageCount}...`);

      const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          key: YOUTUBE_API_KEY,
          playlistId: playlistId,
          part: "contentDetails",
          maxResults: 50,
          pageToken: nextPageToken,
        },
      });

      const videoIds = response.data.items
        .map((item) => item.contentDetails.videoId)
        .filter((id) => id); // Remove any null/undefined

      allVideoIds = [...allVideoIds, ...videoIds];
      nextPageToken = response.data.nextPageToken;

      console.log(
        `     ✓ Got ${videoIds.length} videos (total: ${allVideoIds.length})`
      );

      // Stop if we've reached maxVideos limit
      if (maxVideos > 0 && allVideoIds.length >= maxVideos) {
        allVideoIds = allVideoIds.slice(0, maxVideos);
        console.log(`     ℹ️  Reached limit of ${maxVideos} videos`);
        break;
      }

      // Small delay to avoid rate limiting
      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (nextPageToken);

    return allVideoIds;
  }

  /**
   * Fetch detailed information for videos in batches
   * Cost: 1 quota per 50 videos
   */
  async fetchVideosDetails(videoIds, channel) {
    const allVideos = [];
    const batchSize = 50;
    const totalBatches = Math.ceil(videoIds.length / batchSize);

    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;

      console.log(
        `  🔍 Fetching details batch ${batchNum}/${totalBatches} (${batch.length} videos)...`
      );

      const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          key: YOUTUBE_API_KEY,
          id: batch.join(","),
          part: "snippet,statistics,contentDetails",
        },
      });

      const videos = response.data.items.map((video) => ({
        youtubeId: video.id,
        channel: channel,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: {
          default: video.snippet.thumbnails.default?.url,
          medium: video.snippet.thumbnails.medium?.url,
          high: video.snippet.thumbnails.high?.url,
        },
        duration: this.parseDuration(video.contentDetails.duration),
        publishedAt: new Date(video.snippet.publishedAt),
        views: parseInt(video.statistics.viewCount) || 0,
        likes: parseInt(video.statistics.likeCount) || 0,
        tags: video.snippet.tags || [],
        channelTitle: video.snippet.channelTitle,
      }));

      allVideos.push(...videos);

      // Small delay between batches
      if (i + batchSize < videoIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return allVideos;
  }

  /**
   * Backward compatibility: Old method using search
   * Use this as fallback if playlist method fails
   */
  async fetchChannelVideosDeep(channel, totalDesired = 200, orderBy = "date") {
    console.warn(
      `⚠️  Using legacy search method (expensive). Consider using fetchAllChannelVideos instead.`
    );

    const channelData = CHANNELS[channel];
    if (!channelData) {
      throw new Error(`Unknown channel: ${channel}`);
    }

    const order =
      orderBy === "popular" || orderBy === "viewCount" ? "viewCount" : "date";
    let allVideoIds = [];
    let pageToken = null;

    while (allVideoIds.length < totalDesired) {
      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: YOUTUBE_API_KEY,
          channelId: channelData.channelId,
          part: "id",
          order: order,
          type: "video",
          maxResults: 50,
          pageToken: pageToken,
        },
      });

      const videoIds = response.data.items
        .filter((item) => item.id.videoId)
        .map((item) => item.id.videoId);

      allVideoIds = [...allVideoIds, ...videoIds];
      pageToken = response.data.nextPageToken;

      if (!pageToken) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.fetchVideosDetails(allVideoIds.slice(0, totalDesired), channel);
  }

  parseDuration(duration) {
    if (!duration) return "0:00";

    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "0:00";

    const hours = (match[1] || "").replace("H", "");
    const minutes = (match[2] || "").replace("M", "");
    const seconds = (match[3] || "").replace("S", "");

    const parts = [];
    if (hours) parts.push(hours);
    parts.push((minutes || "0").padStart(2, "0"));
    parts.push((seconds || "0").padStart(2, "0"));

    return parts.join(":");
  }
}

module.exports = new YouTubeService();
