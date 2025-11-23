import React, { useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { formatViews, formatDate } from "../../utils/formatters";

const VideoPlayerModal = ({ video, onClose }) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeId}`;
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`;

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-700">
          <div className="flex-1 pr-4">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              {video.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm text-gray-400">
              <span className="px-2 py-1 bg-gray-800 rounded">
                {video.channel?.toUpperCase()}
              </span>
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDate(video.publishedAt)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Open in YouTube */}
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Open in YouTube"
            >
              <ExternalLink size={24} />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Close (ESC)"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Description */}
        {video.description && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-6">
              {video.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {video.tags.slice(0, 10).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="p-4 bg-gray-800 text-center text-sm text-gray-400">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd> or
          click outside to close
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
