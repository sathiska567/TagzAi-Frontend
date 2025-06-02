// CustomDropdown.js
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import CustomSwitch from "./CustomSwitch";
import { optionsSetOne, optionsSetTwo, optionsSetThree } from "./DropDownData";

const CustomDropdown = ({ topic, optionNumber, settings, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (setting) => {
    if (onToggle) {
      onToggle(setting, !settings[setting]);
    }
  };

  // Determine which option set to use
  let options;
  switch (optionNumber) {
    case 1:
      options = optionsSetOne;
      break;
    case 2:
      options = optionsSetTwo;
      break;
    case 3:
      options = optionsSetThree;
      break;
    default:
      options = optionsSetOne;
  }

  return (
    <div className="mb-4 sm:mb-6 relative group">
      {/* Main container with enhanced 3D shadow */}
      <div
        className="relative overflow-hidden rounded-xl border transition-all duration-300"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#EDE4FF",
          boxShadow: isExpanded
            ? "0 20px 40px -12px rgba(125, 91, 198, 0.25), 0 8px 16px -4px rgba(125, 91, 198, 0.1), 0 4px 6px -2px rgba(125, 91, 198, 0.05)"
            : "0 10px 20px -8px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Dropdown Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white text-gray-800 hover:bg-gray-50 transition-all duration-300 outline-none"
          style={{ backgroundColor: "#FFFEFF" }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-1 h-6 sm:h-8 rounded-full shadow-sm"
              style={{ backgroundColor: "#7D5BC6" }}
            ></div>
            <span className="font-semibold text-sm sm:text-base text-gray-800">
              {topic}
            </span>
          </div>
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full shadow-inner transition-all duration-300"
            style={{ backgroundColor: "#EDE4FF" }}
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-500 ${
                isExpanded ? "rotate-180 text-purple-600" : "text-gray-500"
              }`}
              style={{ color: isExpanded ? "#7D5BC6" : "#6B7280" }}
            />
          </div>
        </button>

        {/* Dropdown Content */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          style={{ backgroundColor: "#FFFEFF" }}
        >
          <div className="p-2 divide-y divide-gray-100">
            {options.map(({ label, setting, icon }) => (
              <CustomSwitch
                key={setting}
                label={label}
                checked={settings[setting]}
                onChange={() => handleToggle(setting)}
                hasInfo={icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;
