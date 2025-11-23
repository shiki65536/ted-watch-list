import React, { useState, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useVideos } from "./hooks/useVideos";
import { useUserActions } from "./hooks/useUserActions";

// Layout Components
import Header from "./components/layout/Header";
import Navigation from "./components/layout/Navigation";
import MobileMenu from "./components/layout/MobileMenu";

// Channel Component
import ChannelSelector from "./components/channel/ChannelSelector";

// Video Components
import VideoGrid from "./components/video/VideoGrid";
import VideoPlayerModal from "./components/video/VideoPlayerModal";

// Auth Component
import AuthModal from "./components/auth/AuthModal";

const App = () => {
  const { token, isAuthenticated } = useAuth();

  // State Management
  const [selectedChannel, setSelectedChannel] = useState("ted");
  const [currentView, setCurrentView] = useState("recent");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);

  // Custom Hooks
  const { videos, loading, error, hasMore, loadMore, refetch } = useVideos(
    selectedChannel,
    currentView,
    token,
    isAuthenticated
  );

  const {
    favourites,
    watched,
    toggleFavourite,
    markAsWatched,
    removeFromWatched,
  } = useUserActions(token, isAuthenticated);

  // Filter videos by current channel for Bucket/Favourite/Watched views
  const getFilteredVideos = () => {
    if (["recent", "popular"].includes(currentView)) {
      return videos;
    }

    // For Bucket, Favourite, Watched - filter by current channel
    return videos.filter((video) => video.channel === selectedChannel);
  };

  const displayedVideos = getFilteredVideos();

  // Handle video play
  const handlePlay = useCallback(
    (video) => {
      setPlayingVideo(video);

      // Optionally auto-mark as watched when playing
      if (isAuthenticated && !watched.includes(video.youtubeId)) {
        markAsWatched(video.youtubeId);
      }
    },
    [isAuthenticated, watched, markAsWatched]
  );

  // Handle authenticated operations
  const handleToggleFavourite = useCallback(
    async (videoId) => {
      console.log(
        `❤️ Toggle favourite: ${videoId}, Current view: ${currentView}`
      );

      const result = await toggleFavourite(videoId);

      if (result.requireAuth) {
        setShowAuthModal(true);
        return;
      }

      // Only refetch if we're currently viewing favourites
      // This prevents the view from changing unexpectedly
      if (result.success && currentView === "favourite") {
        console.log("🔄 Refetching favourites after toggle");
        // Small delay to ensure backend has processed the change
        setTimeout(() => {
          refetch();
        }, 100);
      } else {
        console.log(
          "✅ Favourite toggled, not refetching (not in favourite view)"
        );
      }
    },
    [currentView, toggleFavourite, refetch]
  );

  const handleMarkAsWatched = useCallback(
    async (videoId) => {
      console.log(
        `👁️ Mark as watched: ${videoId}, Current view: ${currentView}`
      );

      const result = await markAsWatched(videoId);

      if (result.requireAuth) {
        setShowAuthModal(true);
        return;
      }

      // Only refetch if we're viewing bucket or watched
      if (result.success && ["bucket", "watched"].includes(currentView)) {
        console.log("🔄 Refetching after marking as watched");
        setTimeout(() => {
          refetch();
        }, 100);
      } else {
        console.log(
          "✅ Marked as watched, not refetching (not in bucket/watched view)"
        );
      }
    },
    [currentView, markAsWatched, refetch]
  );

  const handleRemoveFromWatched = useCallback(
    async (videoId) => {
      console.log(
        `🔄 Remove from watched: ${videoId}, Current view: ${currentView}`
      );

      const result = await removeFromWatched(videoId);

      // Only refetch if we're viewing bucket or watched
      if (result.success && ["bucket", "watched"].includes(currentView)) {
        console.log("🔄 Refetching after removing from watched");
        setTimeout(() => {
          refetch();
        }, 100);
      } else {
        console.log("✅ Removed from watched, not refetching");
      }
    },
    [currentView, removeFromWatched, refetch]
  );

  // Handle channel change
  const handleChannelChange = useCallback((channel) => {
    console.log(`📺 Channel changed to: ${channel}`);
    setSelectedChannel(channel);
    setMobileMenuOpen(false);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view) => {
    console.log(`🔀 View changed to: ${view}`);
    setCurrentView(view);
    setMobileMenuOpen(false);
  }, []);

  // Get view title with channel info
  const getViewTitle = () => {
    const channelNames = {
      ted: "TED",
      teded: "TED-Ed",
      tedx: "TEDx",
    };

    const viewTitles = {
      recent: "Recent Videos",
      popular: "Most Popular Videos (All Time)",
      bucket: `${channelNames[selectedChannel]} Bucket`,
      favourite: `${channelNames[selectedChannel]} Favourites`,
      watched: `${channelNames[selectedChannel]} Watched`,
    };

    return viewTitles[currentView] || "Videos";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <Header
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
        onShowAuth={() => setShowAuthModal(true)}
      />

      {/* Channel Selector */}
      <ChannelSelector
        selectedChannel={selectedChannel}
        onChannelChange={handleChannelChange}
      />

      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Navigation
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentView={currentView}
        onViewChange={handleViewChange}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Content Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">
              {getViewTitle()}
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              {loading && videos.length === 0
                ? "Loading..."
                : `${displayedVideos.length} videos`}
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Critical Error Message */}
        {error && (
          <div className="mb-6 bg-red-600 bg-opacity-20 border-2 border-red-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  Failed to Load Videos
                </h3>
                <p className="text-red-200 mb-3">{error}</p>
                <div className="space-y-2 text-sm">
                  <p className="text-red-300">Possible causes:</p>
                  <ul className="list-disc list-inside text-red-200 space-y-1">
                    <li>Backend server is not running</li>
                    <li>Database connection failed</li>
                    <li>Authentication token expired</li>
                    <li>Network connection issue</li>
                  </ul>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Required Message */}
        {!isAuthenticated &&
          ["favourite", "watched", "bucket"].includes(currentView) &&
          !error && (
            <div className="mb-6 bg-yellow-600 bg-opacity-20 border border-yellow-600 text-yellow-200 px-4 py-3 rounded">
              <p className="mb-2">This feature requires authentication</p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition-colors"
              >
                Login Now
              </button>
            </div>
          )}

        {/* Channel Info for Bucket/Favourite/Watched */}
        {["bucket", "favourite", "watched"].includes(currentView) &&
          displayedVideos.length > 0 &&
          !error && (
            <div className="mb-4 text-sm text-gray-400">
              Showing {selectedChannel.toUpperCase()} videos only. Switch
              channels above to see videos from other channels.
            </div>
          )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-4 text-xs text-gray-500 font-mono">
            View: {currentView} | Videos: {videos.length} | Filtered:{" "}
            {displayedVideos.length} | Loading: {loading ? "Yes" : "No"}
          </div>
        )}

        {/* Video Grid */}
        {!error && (
          <VideoGrid
            videos={displayedVideos}
            loading={loading}
            favourites={favourites}
            watched={watched}
            onToggleFavourite={handleToggleFavourite}
            onMarkAsWatched={handleMarkAsWatched}
            onRemoveFromWatched={handleRemoveFromWatched}
            currentView={currentView}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onPlay={handlePlay}
          />
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </div>
  );
};

export default App;
