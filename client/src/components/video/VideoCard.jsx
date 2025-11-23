import React from "react";
import { Play, ExternalLink } from "lucide-react";
import VideoActions from "./VideoActions";
import { formatViews, formatDate } from "../../utils/formatters";

const VideoCard = ({
  video,
  isFavourite,
  isWatched,
  onToggleFavourite,
  onMarkAsWatched,
  onRemoveFromWatched,
  showWatchedAction,
  onPlay,
}) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;

  const handleCardClick = (e) => {
    // Don't trigger if clicking on action buttons
    if (e.target.closest("button")) {
      return;
    }

    // Open video in modal or new tab
    if (onPlay) {
      onPlay(video);
    }
  };

  return (
    <div
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Thumbnail with Play Button Overlay */}
      <div className="relative aspect-video group">
        <img
          src={video.thumbnail?.medium || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
            <div className="bg-red-600 rounded-full p-4 shadow-2xl">
              <Play size={32} fill="white" className="text-white ml-1" />
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs md:text-sm">
          {video.duration}
        </div>

        {/* Channel Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
          {video.channel?.toUpperCase()}
        </div>

        {/* External Link Button */}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-black bg-opacity-75 hover:bg-opacity-90 p-2 rounded transition-all opacity-0 group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
          title="Open in YouTube"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Title */}
        <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem] hover:text-red-400 transition-colors">
          {video.title}
        </h3>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
          <span>{formatViews(video.views)} views</span>
          <span className="hidden sm:inline">•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        {/* Actions */}
        <VideoActions
          video={video}
          isFavourite={isFavourite}
          isWatched={isWatched}
          onToggleFavourite={onToggleFavourite}
          onMarkAsWatched={onMarkAsWatched}
          onRemoveFromWatched={onRemoveFromWatched}
          showWatchedAction={showWatchedAction}
        />
      </div>
    </div>
  );
};

export default VideoCard;
