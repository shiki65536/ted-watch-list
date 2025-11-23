import React from "react";
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
}) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:scale-105">
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <img
          src={video.thumbnail?.medium || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs md:text-sm">
          {video.duration}
        </div>

        {/* Channel Badge */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
          {video.channel?.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        {/* Title */}
        <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem]">
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
