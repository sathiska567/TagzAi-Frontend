import React from "react";
import { Check } from "lucide-react";

const FileLimitation = ({ limitations }) => {
  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Background with enhanced shadow */}
      <div
        className="absolute inset-0 rounded-2xl border shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{
          backgroundColor: "#FFFEFF",
          borderColor: "#EDE4FF",
        }}
      ></div>

      {/* Decorative corner elements */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>
      <div
        className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full opacity-10"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>

      {/* Grid pattern overlay with very subtle opacity */}
      <div
        className="absolute inset-0 opacity-5 rounded-2xl"
        style={{
          backgroundSize: "20px 20px",
          backgroundImage: `linear-gradient(to right, #7D5BC6 1px, transparent 1px), linear-gradient(to bottom, #7D5BC6 1px, transparent 1px)`,
        }}
      ></div>

      {/* Centered cards container */}
      <div className="flex flex-wrap gap-3 sm:gap-4 relative z-10 py-2 justify-center items-center">
        {limitations.map((item, index) => (
          <div
            key={index}
            className="flex items-center px-3 sm:px-4 py-2 sm:py-3 rounded-xl border transition-all duration-300 shadow-md hover:shadow-lg group transform hover:-translate-y-1"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EDE4FF",
            }}
          >
            <div
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-sm group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: "#7D5BC6" }}
            >
              <Check size={12} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">
                {item.label}
              </span>
              <span
                className="font-bold text-sm sm:text-base group-hover:text-purple-700 transition-colors duration-300"
                style={{ color: "#374151" }}
              >
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileLimitation;
