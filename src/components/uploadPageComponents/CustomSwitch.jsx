// CustomSwitch.js
import React from "react";
import { Info, Check } from "lucide-react";

const CustomSwitch = ({ label, hasInfo = false, checked, onChange }) => {
  return (
    <div
      className="flex items-center justify-between py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 group hover:shadow-md"
      style={{
        backgroundColor: "transparent",
        "&:hover": { backgroundColor: "#FFFEFF" },
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFFEFF")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
    >
      <div className="flex items-center gap-2 sm:gap-3 text-gray-800 text-sm sm:text-base">
        <span className="font-medium">{label}</span>
        {hasInfo && (
          <button
            className="w-5 h-5 flex items-center justify-center rounded-full transition-all duration-300 transform hover:rotate-12 hover:scale-110 outline-none"
            style={{
              backgroundColor: "#EDE4FF",
              boxShadow:
                "0 2px 4px -1px rgba(125, 91, 198, 0.2), 0 1px 2px -1px rgba(125, 91, 198, 0.1)",
            }}
          >
            <Info size={12} style={{ color: "#7D5BC6" }} />
          </button>
        )}
      </div>

      {/* Modern toggle switch with enhanced 3D shadow */}
      <div className="relative">
        <button
          onClick={onChange}
          className="relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none"
          style={{
            backgroundColor: checked ? "#7D5BC6" : "#D1D5DB",
            boxShadow: checked
              ? "0 8px 20px -4px rgba(125, 91, 198, 0.4), 0 4px 6px -2px rgba(125, 91, 198, 0.1), inset 0 2px 4px rgba(125, 91, 198, 0.2)"
              : "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
          }}
        >
          <span className="sr-only">Toggle setting</span>

          {/* Toggle knob with enhanced 3D shadow */}
          <span
            className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full ring-0 transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: checked ? "#EDE4FF" : "#FFFFFF",
              transform: checked ? "translateX(24px)" : "translateX(0)",
              boxShadow: checked
                ? "0 6px 16px -4px rgba(125, 91, 198, 0.5), 0 2px 4px -1px rgba(125, 91, 198, 0.1)"
                : "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Checkmark icon */}
            <span
              className={`absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-300 ${
                checked ? "opacity-100" : "opacity-0"
              }`}
            >
              <Check size={12} style={{ color: "#7D5BC6" }} />
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default CustomSwitch;
