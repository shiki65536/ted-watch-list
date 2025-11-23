// API Service for TED Manager
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  // Authentication
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async register(email, password, username) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    return response.json();
  }

  async getMe(token) {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  // Videos with pagination
  async getVideos(channel, sortBy = "recent", page = 1, limit = 20) {
    const response = await fetch(
      `${API_BASE}/videos/${channel}?sortBy=${sortBy}&page=${page}&limit=${limit}`
    );
    return response.json();
  }

  async refreshVideos(token, channel = null) {
    const response = await fetch(`${API_BASE}/videos/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel }),
    });
    return response.json();
  }

  // Favourites
  async getFavourites(token) {
    const response = await fetch(`${API_BASE}/user/favourites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  async addFavourite(token, videoId) {
    const response = await fetch(`${API_BASE}/user/favourites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });
    return response.json();
  }

  async removeFavourite(token, videoId) {
    const response = await fetch(`${API_BASE}/user/favourites/${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  // Watched
  async getWatched(token) {
    const response = await fetch(`${API_BASE}/user/watched`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  async addWatched(token, videoId) {
    const response = await fetch(`${API_BASE}/user/watched`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ videoId }),
    });
    return response.json();
  }

  async removeWatched(token, videoId) {
    const response = await fetch(`${API_BASE}/user/watched/${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  }

  // Bucket with pagination
  async getBucket(token, page = 1, limit = 20) {
    const response = await fetch(
      `${API_BASE}/user/bucket?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  }
}

export default new ApiService();
