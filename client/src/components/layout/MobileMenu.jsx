import React from "react";
import Navigation from "./Navigation";

const MobileMenu = ({ isOpen, currentView, onViewChange, onClose }) => {
  if (!isOpen) return null;

  const handleViewChange = (view) => {
    onViewChange(view);
    onClose();
  };

  return (
    <div className="lg:hidden bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <Navigation
          currentView={currentView}
          onViewChange={handleViewChange}
          isMobile={true}
        />
      </div>
    </div>
  );
};

export default MobileMenu;
