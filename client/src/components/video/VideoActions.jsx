import React from "react";
import { Heart, Eye, RotateCcw } from "lucide-react";

const VideoActions = ({
  video,
  isFavourite,
  isWatched,
  onToggleFavourite,
  onMarkAsWatched,
  onRemoveFromWatched,
  showWatchedAction,
}) => {
  return (
    <div className="flex gap-2">
      {/* Favourite Button */}
      <button
        onClick={() => onToggleFavourite(video.youtubeId)}
        className={`
          flex-1 flex items-center justify-center gap-1 md:gap-2 
          px-2 md:px-3 py-2 rounded transition-colors text-xs md:text-sm
          ${
            isFavourite
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-700 hover:bg-gray-600"
          }
        `}
      >
        <Heart size={14} fill={isFavourite ? "currentColor" : "none"} />
        <span className="hidden sm:inline">Favourite</span>
      </button>

      {/* Watched / Restore Button */}
      {showWatchedAction ? (
        <button
          onClick={() => onRemoveFromWatched(video.youtubeId)}
          className="
            flex-1 flex items-center justify-center gap-1 md:gap-2 
            px-2 md:px-3 py-2 bg-gray-700 hover:bg-gray-600 
            rounded transition-colors text-xs md:text-sm
          "
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Restore</span>
        </button>
      ) : (
        <button
          onClick={() => onMarkAsWatched(video.youtubeId)}
          disabled={isWatched}
          className={`
            flex-1 flex items-center justify-center gap-1 md:gap-2 
            px-2 md:px-3 py-2 rounded transition-colors text-xs md:text-sm
            ${
              isWatched
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }
          `}
        >
          <Eye size={14} />
          <span className="hidden sm:inline">
            {isWatched ? "Watched" : "Mark"}
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoActions;
