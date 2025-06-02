// CustomInput.js
import React, { useState } from "react";

const CustomInput = ({
  label,
  placeholder,
  icon,
  multiline = false,
  rows = 1,
  value,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-4 sm:mb-6 relative group">
      <div className="relative">
        <label className="block text-gray-800 font-semibold mb-2 ml-1 text-sm sm:text-base">
          <span style={{ color: "#7D5BC6" }}>{label}</span>
        </label>

        {multiline ? (
          <div className="relative">
            <textarea
              placeholder={placeholder}
              rows={rows}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full text-gray-800 placeholder-gray-500 rounded-xl border transition-all duration-300 p-3 sm:p-4 outline-none resize-none shadow-md hover:shadow-lg focus:shadow-xl"
              style={{
                backgroundColor: isFocused ? "#EDE4FF" : "#FFFFFF",
                borderColor: isFocused ? "#7D5BC6" : "#D1D5DB",
                boxShadow: isFocused
                  ? "0 10px 25px -5px rgba(125, 91, 198, 0.3), 0 4px 6px -2px rgba(125, 91, 198, 0.05), inset 0 2px 4px rgba(125, 91, 198, 0.1)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>
        ) : (
          <div className="relative">
            <div
              className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none"
              style={{ color: "#7D5BC6" }}
            >
              {icon}
            </div>
            <input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full text-gray-800 placeholder-gray-500 rounded-xl border transition-all duration-300 pl-10 sm:pl-11 p-3 sm:p-4 outline-none shadow-md hover:shadow-lg focus:shadow-xl"
              style={{
                backgroundColor: isFocused ? "#EDE4FF" : "#FFFFFF",
                borderColor: isFocused ? "#7D5BC6" : "#D1D5DB",
                boxShadow: isFocused
                  ? "0 10px 25px -5px rgba(125, 91, 198, 0.3), 0 4px 6px -2px rgba(125, 91, 198, 0.05), inset 0 2px 4px rgba(125, 91, 198, 0.1)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
