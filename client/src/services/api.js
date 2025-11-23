// API Service for TED Manager
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Request queue to prevent duplicate simultaneous requests
const activeRequests = new Map();

class ApiService {
  /**
   * Generic fetch with error handling
   */
  async fetchWithErrorHandling(url, options = {}) {
    const requestKey = `${options.method || "GET"}_${url}`;

    if (activeRequests.has(requestKey)) {
      console.log(`⏳ Request already in progress: ${requestKey}`);
      return activeRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      try {
        console.log(`📤 API Request: ${options.method || "GET"} ${url}`);

        const response = await fetch(url, options);

        console.log(`📥 API Response: ${response.status} ${url}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Error Response:`, errorText);

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }

          let errorMessage = errorData.message;
          if (
            !errorMessage &&
            errorData.errors &&
            Array.isArray(errorData.errors) &&
            errorData.errors.length > 0
          ) {
            errorMessage =
              errorData.errors[0].msg || errorData.errors[0].message;
          }

          if (!errorMessage) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }

          throw new Error(errorMessage);
          // throw new Error(
          //   errorData.message ||
          //     `HTTP ${response.status}: ${response.statusText}`
          // );
        }

        const text = await response.text();

        if (!text) {
          return { success: true, data: [] };
        }

        try {
          return JSON.parse(text);
        } catch (parseError) {
          console.error("❌ JSON Parse Error:", parseError);
          console.error("Response text:", text.substring(0, 200));
          throw new Error("Invalid JSON response from server");
        }
      } finally {
        activeRequests.delete(requestKey);
      }
    })();

    activeRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  // Authentication
  async login(email, password) {
    return this.fetchWithErrorHandling(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email, password, username, youtubeApiKey = null) {
    return this.fetchWithErrorHandling(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username, youtubeApiKey }),
    });
  }

  async getMe(token) {
    return this.fetchWithErrorHandling(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // API Key Management
  async updateApiKey(token, youtubeApiKey) {
    return this.fetchWithErrorHandling(`${API_BASE}/auth/api-key`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ youtubeApiKey }),
    });
  }

  async deleteApiKey(token) {
    return this.fetchWithErrorHandling(`${API_BASE}/auth/api-key`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Videos with pagination
  async getVideos(channel, sortBy = "recent", page = 1, limit = 20) {
    return this.fetchWithErrorHandling(
      `${API_BASE}/videos/${channel}?sortBy=${sortBy}&page=${page}&limit=${limit}`
    );
  }

  async refreshVideos(token, channel = null) {
    return this.fetchWithErrorHandling(`${API_BASE}/videos/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel }),
    });
  }

  // Favourites
  async getFavourites(token) {
    return this.fetchWithErrorHandling(`${API_BASE}/user/favourites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addFavourite(token, videoId) {
    return this.fetchWithErrorHandling(`${API_BASE}/user/favourites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });
  }

  async removeFavourite(token, videoId) {
    return this.fetchWithErrorHandling(
      `${API_BASE}/user/favourites/${videoId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  // Watched
  async getWatched(token) {
    return this.fetchWithErrorHandling(`${API_BASE}/user/watched`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addWatched(token, videoId) {
    return this.fetchWithErrorHandling(`${API_BASE}/user/watched`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });
  }

  async removeWatched(token, videoId) {
    return this.fetchWithErrorHandling(`${API_BASE}/user/watched/${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Bucket with pagination
  async getBucket(token, page = 1, limit = 20) {
    return this.fetchWithErrorHandling(
      `${API_BASE}/user/bucket?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}

export default new ApiService();
