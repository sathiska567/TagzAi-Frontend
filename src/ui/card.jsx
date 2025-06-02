import React from "react";

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = "",
  shadow = "md",
  padding = "md",
  border = true,
  rounded = "lg",
  hover = true,
}) => {
  // Card shadow options with professional 3D shadows
  const shadows = {
    none: "",
    sm: "0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
    md: "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    xl: "0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)",
  };

  // Hover shadow options
  const hoverShadows = {
    none: "",
    sm: "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    md: "0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)",
    xl: "0 24px 48px -12px rgba(0, 0, 0, 0.25), 0 16px 32px -8px rgba(0, 0, 0, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.15)",
  };

  // Card padding options
  const paddings = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  // Card border radius options
  const roundedOptions = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={`
        w-full 
        overflow-hidden
        ${roundedOptions[rounded]} 
        ${
          hover
            ? "transition-all duration-300 transform hover:-translate-y-1"
            : ""
        } 
        ${className}
      `}
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: border ? "1px" : "0",
        borderColor: "#EDE4FF",
        borderStyle: "solid",
        boxShadow: shadows[shadow],
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = hoverShadows[shadow];
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.boxShadow = shadows[shadow];
        }
      }}
    >
      {(title || subtitle) && (
        <div
          className="px-6 py-4"
          style={{
            borderBottomWidth: "1px",
            borderBottomColor: "#EDE4FF",
            borderBottomStyle: "solid",
          }}
        >
          {title && (
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 font-medium">{subtitle}</p>
          )}
        </div>
      )}

      <div className={paddings[padding]}>{children}</div>

      {footer && (
        <div
          className="px-6 py-4"
          style={{
            borderTopWidth: "1px",
            borderTopColor: "#EDE4FF",
            borderTopStyle: "solid",
            backgroundColor: "#FFFEFF",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
