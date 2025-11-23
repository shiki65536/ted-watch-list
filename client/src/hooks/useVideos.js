import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export const useVideos = (
  selectedChannel,
  currentView,
  token,
  isAuthenticated
) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Reset when channel or view changes
  useEffect(() => {
    console.log(
      `🔄 Resetting state - Channel: ${selectedChannel}, View: ${currentView}`
    );
    setVideos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [selectedChannel, currentView]);

  // Fetch videos function
  const fetchVideos = useCallback(
    async (currentPage) => {
      // Don't fetch if already loading
      if (loading) {
        console.log("⏸️  Already loading, skipping...");
        return;
      }

      // Don't fetch if no more data and not first page
      if (!hasMore && currentPage > 1) {
        console.log("⏹️  No more data, skipping...");
        return;
      }

      console.log(
        `📥 Fetching videos - Page: ${currentPage}, View: ${currentView}`
      );
      setLoading(true);
      setError(null);

      try {
        let result;

        if (currentView === "favourite" && isAuthenticated) {
          console.log("📥 Fetching favourites...");
          result = await api.getFavourites(token);
          setVideos(result.data || []);
          setHasMore(false);
        } else if (currentView === "watched" && isAuthenticated) {
          console.log("📥 Fetching watched...");
          result = await api.getWatched(token);
          setVideos(result.data || []);
          setHasMore(false);
        } else if (currentView === "bucket" && isAuthenticated) {
          console.log(`📥 Fetching bucket - Page ${currentPage}...`);
          result = await api.getBucket(token, currentPage, 20);
          setVideos((prev) => {
            if (currentPage === 1) {
              return result.data || [];
            } else {
              const existingIds = new Set(prev.map((v) => v.youtubeId));
              const newVideos = (result.data || []).filter(
                (v) => !existingIds.has(v.youtubeId)
              );
              return [...prev, ...newVideos];
            }
          });
          setHasMore(result.hasMore);
        } else if (currentView === "favourite" && !isAuthenticated) {
          console.log("⚠️  Not authenticated for favourites");
          setVideos([]);
          setHasMore(false);
        } else if (currentView === "watched" && !isAuthenticated) {
          console.log("⚠️  Not authenticated for watched");
          setVideos([]);
          setHasMore(false);
        } else if (currentView === "bucket" && !isAuthenticated) {
          console.log("⚠️  Not authenticated for bucket");
          setVideos([]);
          setHasMore(false);
        } else {
          // Recent or Popular with pagination
          const sortBy = currentView === "popular" ? "popular" : "recent";
          console.log(`📥 Fetching ${sortBy} videos - Page ${currentPage}...`);
          result = await api.getVideos(
            selectedChannel,
            sortBy,
            currentPage,
            20
          );

          setVideos((prev) => {
            if (currentPage === 1) {
              console.log(
                `✅ Loaded ${result.data?.length || 0} videos (fresh)`
              );
              return result.data || [];
            } else {
              const existingIds = new Set(prev.map((v) => v.youtubeId));
              const newVideos = (result.data || []).filter(
                (v) => !existingIds.has(v.youtubeId)
              );
              console.log(
                `✅ Added ${newVideos.length} more videos (total: ${
                  prev.length + newVideos.length
                })`
              );
              return [...prev, ...newVideos];
            }
          });

          setHasMore(result.hasMore);
        }
      } catch (err) {
        console.error("❌ Failed to load videos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedChannel, currentView, token, isAuthenticated, loading, hasMore]
  );

  // Trigger fetch when page changes OR when dependencies change
  useEffect(() => {
    console.log(`🎯 useEffect triggered - Page: ${page}`);
    fetchVideos(page);
  }, [page, selectedChannel, currentView, isAuthenticated]); // Don't include fetchVideos in deps

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      console.log("📜 Load more triggered");
      setPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  // Refetch function (reset to page 1)
  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered");
    setVideos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
};
