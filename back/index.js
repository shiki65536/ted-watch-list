import React, { useState, useEffect } from "react";
import {
  Heart,
  Eye,
  Star,
  TrendingUp,
  Clock,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";

// sample
const SAMPLE_VIDEOS = {
  ted: [
    {
      id: "t1",
      title: "Do schools kill creativity?",
      channel: "TED",
      views: 70000000,
      publishedAt: "2023-06-15",
      thumbnail: "https://via.placeholder.com/320x180/E62B1E/FFFFFF?text=TED",
      duration: "19:24",
    },
    {
      id: "t2",
      title: "The power of vulnerability",
      channel: "TED",
      views: 55000000,
      publishedAt: "2023-09-20",
      thumbnail: "https://via.placeholder.com/320x180/E62B1E/FFFFFF?text=TED",
      duration: "20:18",
    },
    {
      id: "t3",
      title: "Your body language shapes who you are",
      channel: "TED",
      views: 62000000,
      publishedAt: "2023-03-10",
      thumbnail: "https://via.placeholder.com/320x180/E62B1E/FFFFFF?text=TED",
      duration: "21:03",
    },
  ],
  teded: [
    {
      id: "te1",
      title: "How does the stock market work?",
      channel: "TED-Ed",
      views: 15000000,
      publishedAt: "2023-06-15",
      thumbnail:
        "https://via.placeholder.com/320x180/FF6B6B/FFFFFF?text=TED-Ed",
      duration: "5:12",
    },
    {
      id: "te2",
      title: "What is consciousness?",
      channel: "TED-Ed",
      views: 8500000,
      publishedAt: "2023-09-20",
      thumbnail:
        "https://via.placeholder.com/320x180/FF6B6B/FFFFFF?text=TED-Ed",
      duration: "4:58",
    },
    {
      id: "te3",
      title: "Why do we dream?",
      channel: "TED-Ed",
      views: 20000000,
      publishedAt: "2023-11-05",
      thumbnail:
        "https://via.placeholder.com/320x180/FF6B6B/FFFFFF?text=TED-Ed",
      duration: "5:45",
    },
  ],
  tedx: [
    {
      id: "tx1",
      title: "The art of innovation",
      channel: "TEDx",
      views: 3000000,
      publishedAt: "2023-06-15",
      thumbnail: "https://via.placeholder.com/320x180/000000/E62B1E?text=TEDx",
      duration: "15:32",
    },
    {
      id: "tx2",
      title: "Mindfulness in daily life",
      channel: "TEDx",
      views: 2500000,
      publishedAt: "2023-09-20",
      thumbnail: "https://via.placeholder.com/320x180/000000/E62B1E?text=TEDx",
      duration: "12:45",
    },
    {
      id: "tx3",
      title: "Future of education",
      channel: "TEDx",
      views: 4000000,
      publishedAt: "2023-11-05",
      thumbnail: "https://via.placeholder.com/320x180/000000/E62B1E?text=TEDx",
      duration: "18:20",
    },
  ],
};

export default function TEDManager() {
  const [selectedChannel, setSelectedChannel] = useState("ted");
  const [currentView, setCurrentView] = useState("recent");
  const [favourites, setFavourites] = useState([]);
  const [watched, setWatched] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const favResult = await window.storage.get("ted-favourites");
        const watchedResult = await window.storage.get("ted-watched");

        if (favResult) setFavourites(JSON.parse(favResult.value));
        if (watchedResult) setWatched(JSON.parse(watchedResult.value));
      } catch (error) {
        console.log("No storage data in first time usage");
      }
    };
    loadData();
  }, []);

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  const toggleFavourite = (videoId) => {
    const newFavourites = favourites.includes(videoId)
      ? favourites.filter((id) => id !== videoId)
      : [...favourites, videoId];
    setFavourites(newFavourites);
    saveData("ted-favourites", newFavourites);
  };

  const markAsWatched = (videoId) => {
    if (!watched.includes(videoId)) {
      const newWatched = [...watched, videoId];
      setWatched(newWatched);
      saveData("ted-watched", newWatched);
    }
  };

  const removeFromWatched = (videoId) => {
    const newWatched = watched.filter((id) => id !== videoId);
    setWatched(newWatched);
    saveData("ted-watched", newWatched);
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getAllVideos = () => {
    return Object.values(SAMPLE_VIDEOS).flat();
  };

  const getFilteredVideos = () => {
    let filtered =
      selectedChannel === "all"
        ? getAllVideos()
        : SAMPLE_VIDEOS[selectedChannel];

    switch (currentView) {
      case "recent":
        filtered = [...filtered].sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        break;
      case "popular":
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      case "bucket":
        filtered = filtered.filter((v) => !watched.includes(v.id));
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      case "favourite":
        filtered = getAllVideos().filter((v) => favourites.includes(v.id));
        break;
      case "watched":
        filtered = getAllVideos().filter((v) => watched.includes(v.id));
        break;
      default:
        break;
    }

    return filtered;
  };

  const displayedVideos = getFilteredVideos();

  const channels = [
    { id: "ted", label: "TED", color: "bg-red-600" },
    { id: "teded", label: "TED-Ed", color: "bg-orange-600" },
    { id: "tedx", label: "TEDx", color: "bg-black" },
  ];

  const navButtons = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "popular", label: "Popular", icon: TrendingUp },
    { id: "bucket", label: "Bucket", icon: Star },
    { id: "favourite", label: "Favourite", icon: Heart },
    { id: "watched", label: "Watched", icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">TED List</h1>
              <p className="text-red-100 mt-1 text-sm md:text-base hidden sm:block">
                Manage your Ted learning list
              </p>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-red-700 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Channel Selection */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 md:gap-3">
            {channels.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedChannel(id);
                  setMobileMenuOpen(false);
                }}
                className={`px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${
                  selectedChannel === id
                    ? `${color} text-white shadow-lg scale-105`
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <div className="hidden lg:block bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4">
            {navButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === id
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation - Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {navButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setCurrentView(id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  currentView === id
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            {navButtons.find((b) => b.id === currentView)?.label}
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            total: {displayedVideos.length} videos
          </p>
        </div>

        {displayedVideos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No video</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {displayedVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs md:text-sm">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                    {video.channel}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem]">
                    {video.title}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                    <span>{formatViews(video.views)} times watching</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      {new Date(video.publishedAt).toLocaleDateString("zh-TW")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavourite(video.id)}
                      className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded transition-colors text-xs md:text-sm ${
                        favourites.includes(video.id)
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <Heart
                        size={14}
                        fill={
                          favourites.includes(video.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                      <span className="hidden sm:inline">bookmark</span>
                    </button>

                    {currentView === "watched" ? (
                      <button
                        onClick={() => removeFromWatched(video.id)}
                        className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors text-xs md:text-sm"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">redo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsWatched(video.id)}
                        disabled={watched.includes(video.id)}
                        className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded transition-colors text-xs md:text-sm ${
                          watched.includes(video.id)
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">
                          {watched.includes(video.id) ? "watched" : "mark"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
