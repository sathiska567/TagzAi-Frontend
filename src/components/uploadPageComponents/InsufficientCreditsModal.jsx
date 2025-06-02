import React from "react";
import { X, CreditCard, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InsufficientCreditsModal = ({
  isOpen,
  onClose,
  remainingCredits,
  requestedImages,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigateToPricing = () => {
    navigate("/pricing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl animate-fade-in">
        {/* Decorative background elements */}
        <div
          className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20"
          style={{ backgroundColor: "#7D5BC6" }}
        ></div>
        <div
          className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full opacity-20"
          style={{ backgroundColor: "#7D5BC6" }}
        ></div>

        {/* Main content */}
        <div
          className="relative p-6 border shadow-xl"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EDE4FF",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: "#EDE4FF" }}
              >
                <AlertCircle size={20} style={{ color: "#7D5BC6" }} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Insufficient Credits
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
            >
              <X size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Divider */}
          <div
            className="h-px w-full mb-5"
            style={{ backgroundColor: "#EDE4FF" }}
          ></div>

          {/* Content */}
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl border shadow-sm"
              style={{
                backgroundColor: "#EDE4FF",
                borderColor: "#7D5BC6",
              }}
            >
              <p className="text-gray-700 mb-3 font-medium">
                You don't have enough credits to process all these images.
              </p>
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">
                    Remaining Credits
                  </span>
                  <span
                    className="text-2xl font-black"
                    style={{ color: "#7D5BC6" }}
                  >
                    {remainingCredits}
                  </span>
                </div>
                <div
                  className="w-px h-10"
                  style={{ backgroundColor: "#7D5BC6" }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-gray-500 font-medium">
                    Requested Images
                  </span>
                  <span className="text-2xl font-black text-gray-800">
                    {requestedImages}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">
              Please consider upgrading your plan or reducing the number of
              images to match your available credits.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={handleNavigateToPricing}
              className="cursor-pointer flex-1 px-4 py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#7D5BC6" }}
            >
              <CreditCard size={16} />
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;
