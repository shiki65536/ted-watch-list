import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
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

// Auth Component
import AuthModal from "./components/auth/AuthModal";

const App = () => {
  const { token, isAuthenticated } = useAuth();

  // State Management
  const [selectedChannel, setSelectedChannel] = useState("ted");
  const [currentView, setCurrentView] = useState("recent");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Handle authenticated operations
  const handleToggleFavourite = async (videoId) => {
    const result = await toggleFavourite(videoId);
    if (result.requireAuth) {
      setShowAuthModal(true);
    } else if (result.success) {
      refetch();
    }
  };

  const handleMarkAsWatched = async (videoId) => {
    const result = await markAsWatched(videoId);
    if (result.requireAuth) {
      setShowAuthModal(true);
    } else if (result.success) {
      refetch();
    }
  };

  const handleRemoveFromWatched = async (videoId) => {
    await removeFromWatched(videoId);
    refetch();
  };

  // Handle channel change
  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setMobileMenuOpen(false);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-600 bg-opacity-20 border border-red-600 text-red-200 px-4 py-3 rounded">
            Failed to load: {error}
          </div>
        )}

        {/* Login Required Message */}
        {!isAuthenticated &&
          ["favourite", "watched", "bucket"].includes(currentView) && (
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
          displayedVideos.length > 0 && (
            <div className="mb-4 text-sm text-gray-400">
              Showing {selectedChannel.toUpperCase()} videos only. Switch
              channels above to see videos from other channels.
            </div>
          )}

        {/* Video Grid */}
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
        />
      </div>

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
