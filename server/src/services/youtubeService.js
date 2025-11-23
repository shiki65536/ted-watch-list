const axios = require("axios");

const DEFAULT_YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

// Channel IDs and their Uploads Playlist IDs
const CHANNELS = {
  ted: {
    channelId: "UCAuUUnT6oDeKwE6v1NGQxug",
    uploadsId: "UUAuUUnT6oDeKwE6v1NGQxug",
  },
  teded: {
    channelId: "UCsooa4yRKGN_zEE8iknghZA",
    uploadsId: null,
  },
  tedx: {
    channelId: "UCsT0YIqwnpJCM-mx7-gSA4Q",
    uploadsId: null,
  },
};

class YouTubeService {
  /**
   * Get the API key to use (user's key or default)
   */
  getApiKey(userApiKey = null) {
    if (userApiKey) {
      return userApiKey;
    }

    if (DEFAULT_YOUTUBE_API_KEY) {
      return DEFAULT_YOUTUBE_API_KEY;
    }

    throw new Error("YouTube API Key is required");
  }

  /**
   * Get uploads playlist ID for a channel
   */
  async getUploadsPlaylistId(channelId, apiKey = null) {
    try {
      const key = this.getApiKey(apiKey);

      const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
        params: {
          key: key,
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
   * @param {string} channel - Channel name (ted, teded, tedx)
   * @param {number} maxVideos - Maximum videos to fetch (0 = unlimited)
   * @param {string} userApiKey - Optional user's YouTube API key
   */
  async fetchAllChannelVideos(channel, maxVideos = 0, userApiKey) {
    try {
      const channelData = CHANNELS[channel];
      const apiKey = this.getApiKey(userApiKey);

      if (!channelData) {
        throw new Error(`Unknown channel: ${channel}`);
      }

      if (!apiKey) {
        throw new Error("YouTube API key not configured");
      }

      console.log(`   Using ${userApiKey ? "user" : "default"} API key`);

      // Get uploads playlist ID
      let uploadsPlaylistId = channelData.uploadsId;

      if (!uploadsPlaylistId) {
        console.log(`   Fetching uploads playlist ID for ${channel}...`);
        uploadsPlaylistId = await this.getUploadsPlaylistId(
          channelData.channelId,
          apiKey
        );
        console.log(`   Got playlist ID: ${uploadsPlaylistId}`);
      }

      console.log(`\n${"=".repeat(60)}`);
      console.log(`📺 Fetching ALL videos from ${channel.toUpperCase()}`);
      console.log(`   Channel ID: ${channelData.channelId}`);
      console.log(`   Playlist ID: ${uploadsPlaylistId}`);
      console.log("=".repeat(60));

      // Step 1: Get all video IDs
      const videoIds = await this.fetchPlaylistVideoIds(
        uploadsPlaylistId,
        maxVideos,
        apiKey
      );
      console.log(`\n✅ Found ${videoIds.length} videos in playlist`);

      // Step 2: Get detailed info
      const videos = await this.fetchVideosDetails(videoIds, channel, apiKey);
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
   */
  async fetchPlaylistVideoIds(playlistId, maxVideos = 0, apiKey = null) {
    const key = this.getApiKey(apiKey);
    let allVideoIds = [];
    let nextPageToken = null;
    let pageCount = 0;

    do {
      pageCount++;
      console.log(`  📄 Fetching page ${pageCount}...`);

      const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
        params: {
          key: key,
          playlistId: playlistId,
          part: "contentDetails",
          maxResults: 50,
          pageToken: nextPageToken,
        },
      });

      const videoIds = response.data.items
        .map((item) => item.contentDetails.videoId)
        .filter((id) => id);

      allVideoIds = [...allVideoIds, ...videoIds];
      nextPageToken = response.data.nextPageToken;

      console.log(
        `     ✓ Got ${videoIds.length} videos (total: ${allVideoIds.length})`
      );

      if (maxVideos > 0 && allVideoIds.length >= maxVideos) {
        allVideoIds = allVideoIds.slice(0, maxVideos);
        console.log(`     ℹ️  Reached limit of ${maxVideos} videos`);
        break;
      }

      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (nextPageToken);

    return allVideoIds;
  }

  /**
   * Fetch detailed information for videos in batches
   */
  async fetchVideosDetails(videoIds, channel, apiKey = null) {
    const key = this.getApiKey(apiKey);
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
          key: key,
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

      if (i + batchSize < videoIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return allVideos;
  }

  /**
   * Test if an API key is valid
   */
  async testApiKey(apiKey) {
    try {
      if (!apiKey) return { valid: false, error: "API key is missing" };

      const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          key: apiKey,
          part: "id",
          maxResults: 1,
          q: "test",
        },
      });

      return {
        valid: true,
        quota: response.data.pageInfo,
      };
    } catch (error) {
      console.error("API Key Validation Failed:", error.message);
      return {
        valid: false,
        error: "Invalid API Key or Quota exceeded",
      };
    }
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
