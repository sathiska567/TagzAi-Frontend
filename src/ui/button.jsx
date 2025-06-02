import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  type = "button",
  onClick,
}) => {
  // Button variants with professional solid colors and 3D shadows
  const variants = {
    primary: {
      backgroundColor: "#7D5BC6",
      color: "#FFFFFF",
      boxShadow:
        "0 6px 16px -4px rgba(125, 91, 198, 0.4), 0 4px 8px -2px rgba(125, 91, 198, 0.1), 0 2px 4px -1px rgba(125, 91, 198, 0.05)",
      hoverBoxShadow:
        "0 10px 25px -5px rgba(125, 91, 198, 0.5), 0 8px 16px -4px rgba(125, 91, 198, 0.2), 0 4px 6px -2px rgba(125, 91, 198, 0.1)",
      hoverTransform: "translateY(-2px)",
    },
    secondary: {
      backgroundColor: "#FFFFFF",
      color: "#374151",
      borderColor: "#EDE4FF",
      boxShadow:
        "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      hoverBoxShadow:
        "0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.1)",
      hoverBackgroundColor: "#FFFEFF",
      hoverTransform: "translateY(-1px)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#7D5BC6",
      borderColor: "#7D5BC6",
      boxShadow: "0 2px 4px -1px rgba(125, 91, 198, 0.1)",
      hoverBackgroundColor: "#EDE4FF",
      hoverBoxShadow:
        "0 6px 12px -2px rgba(125, 91, 198, 0.2), 0 4px 8px -2px rgba(125, 91, 198, 0.1)",
      hoverTransform: "translateY(-1px)",
    },
    danger: {
      backgroundColor: "#EF4444",
      color: "#FFFFFF",
      boxShadow:
        "0 4px 8px -2px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.1)",
      hoverBoxShadow:
        "0 8px 16px -4px rgba(239, 68, 68, 0.4), 0 4px 8px -2px rgba(239, 68, 68, 0.2)",
      hoverTransform: "translateY(-2px)",
    },
    success: {
      backgroundColor: "#10B981",
      color: "#FFFFFF",
      boxShadow:
        "0 4px 8px -2px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.1)",
      hoverBoxShadow:
        "0 8px 16px -4px rgba(16, 185, 129, 0.4), 0 4px 8px -2px rgba(16, 185, 129, 0.2)",
      hoverTransform: "translateY(-2px)",
    },
  };

  // Button sizes
  const sizes = {
    sm: "py-1.5 px-3 text-sm",
    md: "py-2.5 px-4 text-base",
    lg: "py-3 px-6 text-lg",
  };

  const variantStyle = variants[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${sizes[size]} 
        rounded-xl font-bold transition-all duration-300 
        outline-none
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${variant === "secondary" || variant === "outline" ? "border-2" : ""}
        ${className}
      `}
      style={{
        backgroundColor: disabled ? "#D1D5DB" : variantStyle.backgroundColor,
        color: disabled ? "#9CA3AF" : variantStyle.color,
        borderColor: variantStyle.borderColor || "transparent",
        boxShadow: disabled
          ? "0 2px 4px -1px rgba(0, 0, 0, 0.1)"
          : variantStyle.boxShadow,
        transform: "translateY(0px)",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.target.style.boxShadow = variantStyle.hoverBoxShadow;
          e.target.style.transform = variantStyle.hoverTransform;
          if (variantStyle.hoverBackgroundColor) {
            e.target.style.backgroundColor = variantStyle.hoverBackgroundColor;
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.target.style.boxShadow = variantStyle.boxShadow;
          e.target.style.transform = "translateY(0px)";
          if (variantStyle.hoverBackgroundColor) {
            e.target.style.backgroundColor = variantStyle.backgroundColor;
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !isLoading) {
          e.target.style.transform = "translateY(1px)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !isLoading) {
          e.target.style.transform = variantStyle.hoverTransform;
        }
      }}
      onClick={onClick}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
