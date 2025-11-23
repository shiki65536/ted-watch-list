import React, { useEffect, useRef } from "react";
import VideoCard from "./VideoCard";

const VideoGrid = ({
  videos,
  loading,
  favourites,
  watched,
  onToggleFavourite,
  onMarkAsWatched,
  onRemoveFromWatched,
  currentView,
  onLoadMore,
  hasMore,
  onPlay,
}) => {
  const observerTarget = useRef(null);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore && onLoadMore) {
          console.log("📜 Triggering load more...");
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, hasMore, onLoadMore]);

  if (loading && videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    );
  }

  if (videos.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No videos found</p>
      </div>
    );
  }

  const showWatchedAction = currentView === "watched";

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {videos.map((video, index) => (
          <VideoCard
            key={`${video.youtubeId}-${index}`}
            video={video}
            isFavourite={favourites.includes(video.youtubeId)}
            isWatched={watched.includes(video.youtubeId)}
            onToggleFavourite={onToggleFavourite}
            onMarkAsWatched={onMarkAsWatched}
            onRemoveFromWatched={onRemoveFromWatched}
            showWatchedAction={showWatchedAction}
            onPlay={onPlay}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loading && videos.length > 0 && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-400 text-sm">Loading more...</p>
        </div>
      )}

      {/* Infinite scroll trigger - invisible div at bottom */}
      {hasMore && !loading && videos.length > 0 && (
        <div ref={observerTarget} className="h-20 w-full" />
      )}

      {/* End message */}
      {!hasMore && videos.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No more videos to load</p>
          <p className="text-sm mt-1">Total: {videos.length} videos</p>
        </div>
      )}
    </>
  );
};

export default VideoGrid;
