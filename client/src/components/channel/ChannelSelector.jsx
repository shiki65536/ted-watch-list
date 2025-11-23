import React from "react";

const channels = [
  { id: "ted", label: "TED", color: "bg-red-600" },
  { id: "teded", label: "TED-Ed", color: "bg-orange-600" },
  { id: "tedx", label: "TEDx", color: "bg-black" },
];

const ChannelSelector = ({ selectedChannel, onChannelChange }) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-2 md:gap-3">
          {channels.map(({ id, label, color }) => (
            <button
              key={id}
              onClick={() => onChannelChange(id)}
              className={`
                px-4 md:px-6 py-2 rounded-lg font-semibold 
                transition-all text-sm md:text-base
                ${
                  selectedChannel === id
                    ? `${color} text-white shadow-lg scale-105`
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelSelector;
