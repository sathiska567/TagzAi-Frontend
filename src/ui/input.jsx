import React from "react";

// Create a stylesheet for the autofill styles with professional theme
const createGlobalStyle = () => {
  // Create a style element
  const styleEl = document.createElement("style");
  styleEl.type = "text/css";

  // Define the CSS with professional theme - white background always
  styleEl.innerHTML = `
    /* Chrome, Safari, Edge */
    input.autofill-custom:-webkit-autofill,
    input.autofill-custom:-webkit-autofill:hover,
    input.autofill-custom:-webkit-autofill:focus {
      -webkit-text-fill-color: #374151 !important;
      -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
      box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
      transition: background-color 5000s ease-in-out 0s;
      background-color: #FFFFFF !important;
      border-color: #7D5BC6 !important;
    }
    
    /* Firefox */
    input.autofill-custom:autofill {
      -webkit-text-fill-color: #374151 !important;
      box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
      background-color: #FFFFFF !important;
      border-color: #7D5BC6 !important;
    }
    
    /* For modern browsers that support appearance */
    @supports (-webkit-appearance: none) or (appearance: none) {
      input.autofill-custom:-webkit-autofill::selection,
      input.autofill-custom:autofill::selection {
        background-color: rgba(125, 91, 198, 0.2) !important;
      }
    }
  `;

  // Append the style element to the head once
  if (!document.head.querySelector("#autofill-styles")) {
    styleEl.id = "autofill-styles";
    document.head.appendChild(styleEl);
  }
};

export const Input = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder = "",
  error = "",
  className = "",
  required = false,
  icon = null,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  // Inject the global styles when the component mounts
  React.useEffect(() => {
    createGlobalStyle();
  }, []);

  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold mb-2"
          style={{ color: "#7D5BC6" }}
        >
          {label} {required && <span style={{ color: "#7D5BC6" }}>*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            style={{ color: "#7D5BC6" }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 border rounded-xl font-medium text-gray-800 placeholder-gray-500
            ${icon ? "pl-10" : ""}
            transition-all duration-300
            outline-none
            autofill-custom
          `}
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: error ? "#EF4444" : isFocused ? "#7D5BC6" : "#D1D5DB",
            boxShadow: error
              ? "0 4px 8px -2px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)"
              : isFocused
              ? "0 10px 25px -5px rgba(125, 91, 198, 0.3), 0 4px 6px -2px rgba(125, 91, 198, 0.05), inset 0 2px 4px rgba(125, 91, 198, 0.1)"
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 2px 4px rgba(255, 255, 255, 0.1)",
          }}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
