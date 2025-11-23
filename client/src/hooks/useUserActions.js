import { useState, useEffect } from "react";
import api from "../services/api";

export const useUserActions = (token, isAuthenticated) => {
  const [favourites, setFavourites] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      loadUserData();
    } else {
      setFavourites([]);
      setWatched([]);
    }
  }, [isAuthenticated, token]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [favResult, watchedResult] = await Promise.all([
        api.getFavourites(token),
        api.getWatched(token),
      ]);

      setFavourites(favResult.data?.map((v) => v.youtubeId) || []);
      setWatched(watchedResult.data?.map((v) => v.youtubeId) || []);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavourite = async (videoId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true };
    }

    try {
      if (favourites.includes(videoId)) {
        await api.removeFavourite(token, videoId);
        setFavourites((prev) => prev.filter((id) => id !== videoId));
      } else {
        await api.addFavourite(token, videoId);
        setFavourites((prev) => [...prev, videoId]);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to toggle favourite:", error);
      return { success: false, error };
    }
  };

  const markAsWatched = async (videoId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true };
    }

    try {
      if (!watched.includes(videoId)) {
        await api.addWatched(token, videoId);
        setWatched((prev) => [...prev, videoId]);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to mark as watched:", error);
      return { success: false, error };
    }
  };

  const removeFromWatched = async (videoId) => {
    try {
      await api.removeWatched(token, videoId);
      setWatched((prev) => prev.filter((id) => id !== videoId));
      return { success: true };
    } catch (error) {
      console.error("Failed to remove from watched:", error);
      return { success: false, error };
    }
  };

  return {
    favourites,
    watched,
    loading,
    toggleFavourite,
    markAsWatched,
    removeFromWatched,
    refetch: loadUserData,
  };
};
