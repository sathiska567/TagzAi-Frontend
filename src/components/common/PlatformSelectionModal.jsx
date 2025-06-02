// src/components/common/PlatformSelectionModal.jsx
import React, { useState } from "react";
import { FileText, X, Loader, Download } from "lucide-react";

const PlatformSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  albumId = null,
  albumName = null,
  isMultiple = false,
  selectedCount = 0,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState("shutterstock");

  const platforms = [
    {
      id: "shutterstock",
      name: "Shutterstock",
      description: "Keywords optimized for Shutterstock platform",
      icon: "🖼️",
    },
    {
      id: "adobe_stock",
      name: "Adobe Stock",
      description: "Keywords optimized for Adobe Stock platform",
      icon: "🎨",
    },
    {
      id: "other",
      name: "Other",
      description: "Generic keywords for other platforms",
      icon: "📁",
    },
  ];

  const handleConfirm = () => {
    onConfirm(selectedPlatform);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm bg-black/50 p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose}></div>

      <div className="relative max-w-lg w-full transform transition-all duration-300 animate-scaleIn">
        {/* Modal background with clean white design */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-4 sm:p-6 rounded-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-[#EDE4FF] rounded-full mr-3 shadow-sm flex-shrink-0">
                  <FileText size={20} className="text-[#7D5BC6]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-black truncate">
                    Export Keywords CSV
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">
                    {isMultiple
                      ? `Export keywords for ${selectedCount} albums`
                      : `Export keywords for ${albumName || "album"}`}
                  </p>
                </div>
              </div>

              {!isLoading && (
                <button
                  onClick={handleClose}
                  className="self-end sm:self-auto p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-black mb-3">
                Select Platform:
              </h4>

              <div className="space-y-3">
                {platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${
                      selectedPlatform === platform.id
                        ? "border-[#7D5BC6] bg-[#EDE4FF]/70"
                        : "border-gray-200 hover:border-[#7D5BC6] hover:bg-[#EDE4FF]/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="platform"
                      value={platform.id}
                      checked={selectedPlatform === platform.id}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="sr-only"
                    />

                    <div className="flex items-center flex-1 min-w-0">
                      <span className="text-2xl mr-3 flex-shrink-0">
                        {platform.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-black text-sm sm:text-base">
                          {platform.name}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 break-words">
                          {platform.description}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm flex-shrink-0 ${
                        selectedPlatform === platform.id
                          ? "border-[#7D5BC6] bg-[#7D5BC6]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPlatform === platform.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Album Info */}
            {albumId && !isMultiple && (
              <div className="mb-6 p-3 bg-[#EDE4FF]/50 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-xs sm:text-sm text-gray-600 break-all">
                  <span className="font-medium text-black">Album ID:</span>{" "}
                  {albumId.substring(0, 8)}...
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 disabled:opacity-50 shadow-sm text-center min-h-[44px]"
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                className="px-6 py-3 sm:py-2 rounded-lg bg-[#7D5BC6] hover:bg-[#6b4ba8] text-white transition-all duration-300 flex items-center justify-center disabled:opacity-50 shadow-lg min-h-[44px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PlatformSelectionModal;
