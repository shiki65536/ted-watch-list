import React from "react";
import { Clock, TrendingUp, Star, Heart, Eye } from "lucide-react";

const Navigation = ({ currentView, onViewChange, isMobile = false }) => {
  const navButtons = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "popular", label: "Popular", icon: TrendingUp },
    { id: "bucket", label: "Bucket", icon: Star },
    { id: "favourite", label: "Favourites", icon: Heart },
    { id: "watched", label: "Watched", icon: Eye },
  ];

  const buttonClass = (isActive) => `
    flex items-center gap-2 px-4 py-2 rounded-lg transition-all
    ${
      isActive
        ? "bg-red-600 text-white"
        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
    }
    ${isMobile ? "w-full justify-start" : ""}
  `;

  return (
    <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
      {navButtons.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={buttonClass(currentView === id)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
};

export default Navigation;
