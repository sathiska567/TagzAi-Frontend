// ResultPage.js - Professional White Theme
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResultsSidebar from "./ResultsSidebar";
import ImageGallery from "./ImageGallery";
import PlatformSelectionModal from "../common/PlatformSelectionModal";
import imageService from "../../services/imageService";

// Define styles as a separate object
const globalStyles = `
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Custom scrollbar for Webkit browsers */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #7D5BC6;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #6D28D9;
  }
`;

const ResultPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Platform selection modal state
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const resultData = localStorage.getItem("uploadResult");

      if (resultData) {
        const parsedData = JSON.parse(resultData);
        setUploadResult(parsedData);
      } else {
        setError("No uploaded images found. Please upload images first.");
      }
    } catch (err) {
      console.error("Error loading results:", err);
      setError("Error loading results. Please try uploading images again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add styles to document head on component mount
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Navigate to previous/next image
  const handleNavigate = (direction) => {
    if (
      !uploadResult ||
      !uploadResult.images ||
      uploadResult.images.length === 0
    ) {
      return;
    }

    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev === 0 ? uploadResult.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === uploadResult.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Navigate back to upload page
  const handleBackToUpload = () => {
    navigate("/upload");
  };

  // Open platform selection modal
  const handleExportCSV = () => {
    if (
      !uploadResult ||
      !uploadResult.images ||
      uploadResult.images.length === 0
    ) {
      showToast("No images found to export.", "error");
      return;
    }

    const albumId = uploadResult.images[0]?.album_id;

    if (!albumId) {
      showToast("Album ID not found. Cannot export keywords.", "error");
      return;
    }

    setShowPlatformModal(true);
  };

  // Handle platform selection and CSV download
  const handlePlatformConfirm = async (platform) => {
    const albumId = uploadResult.images[0]?.album_id;

    if (!albumId) {
      showToast("Album ID not found. Cannot export keywords.", "error");
      setShowPlatformModal(false);
      return;
    }

    setIsExporting(true);

    try {
      await imageService.downloadKeywordsCSV(albumId, platform);
      showToast(`Keywords CSV for ${platform} downloaded successfully`);
    } catch (error) {
      console.error("Failed to download CSV:", error);

      let errorMessage = "Failed to download CSV. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsExporting(false);
      setShowPlatformModal(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    if (!isExporting) {
      setShowPlatformModal(false);
    }
  };

  // Format images for ImageGallery component
  const formatImagesForGallery = () => {
    if (!uploadResult || !uploadResult.images) return [];

    return uploadResult.images.map((img, index) => ({
      id: img.image_id,
      src: img.image_link,
      alt: img.title,
      isMain: index === currentImageIndex,
      caption: img.description,
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="text-gray-800 min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FFFEFF" }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin h-8 w-8 border-4 border-t-4 border-r-transparent border-b-4 border-l-transparent rounded-full mb-4"
            style={{
              borderTopColor: "#7D5BC6",
              borderBottomColor: "#7D5BC6",
            }}
          ></div>
          <p className="text-gray-700">Loading results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (
    error ||
    !uploadResult ||
    !uploadResult.images ||
    uploadResult.images.length === 0
  ) {
    return (
      <div
        className="text-gray-800 min-h-screen p-10 flex flex-col items-center justify-center"
        style={{ backgroundColor: "#FFFEFF" }}
      >
        <div
          className="rounded-2xl border shadow-xl p-8 max-w-md text-center"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EDE4FF",
          }}
        >
          <div className="text-5xl mb-4" style={{ color: "#7D5BC6" }}>
            ⚠️
          </div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            No Results Found
          </h2>
          <p className="mb-6 text-gray-600">
            {error ||
              "No images have been tagged yet. Please upload images first."}
          </p>
          <button
            onClick={handleBackToUpload}
            className="text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            style={{ backgroundColor: "#7D5BC6" }}
          >
            Go to Upload Page
          </button>
        </div>
      </div>
    );
  }

  // Current image for sidebar
  const currentImage = uploadResult.images[currentImageIndex];

  // Prepare data for ResultsSidebar
  const productData = {
    id: currentImage.image_id,
    resultNumber: `${currentImageIndex + 1}/${uploadResult.images.length}`,
    title: {
      text: currentImage.title,
      charCount: currentImage.title?.length || 0,
      wordCount: currentImage.title?.split(/\s+/).filter(Boolean).length || 0,
    },
    description: {
      text: currentImage.description,
      charCount: currentImage.description?.length || 0,
      wordCount:
        currentImage.description?.split(/\s+/).filter(Boolean).length || 0,
    },
    keywords: Array.isArray(currentImage.keywords)
      ? currentImage.keywords.map((text, id) => ({ id: id + 1, text }))
      : [],
    album_id: currentImage.album_id,
  };

  // Get album name from the first image or use fallback
  const albumName =
    currentImage.album_name ||
    `Album ${currentImage.album_id?.substring(0, 8)}`;

  return (
    <div
      className="text-gray-800 min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#FFFEFF" }}
    >
      {/* Background decorative elements */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>
      <div
        className="absolute -top-32 -right-32 sm:-top-64 sm:-right-64 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>
      <div
        className="absolute -bottom-32 -left-32 sm:-bottom-64 sm:-left-64 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: "#7D5BC6" }}
      ></div>

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundSize: "15px 15px sm:20px 20px lg:25px 25px xl:30px 30px",
          backgroundImage: `linear-gradient(to right, #7D5BC6 1px, transparent 1px), linear-gradient(to bottom, #7D5BC6 1px, transparent 1px)`,
        }}
      ></div>

      <div className="p-4 md:p-6 lg:p-10 flex flex-col max-h-screen overflow-hidden relative">
        {/* Toast notification */}
        {toast.show && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg z-[100] transition-all duration-300 ${
              toast.type === "success" ? "shadow-lg" : "bg-red-500"
            }`}
            style={{
              backgroundColor: toast.type === "success" ? "#7D5BC6" : "#EF4444",
            }}
          >
            {toast.message}
          </div>
        )}

        {/* Product ID display at top */}
        <div
          className="flex justify-between items-center p-4 rounded-2xl border shadow-lg mb-4"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#EDE4FF",
          }}
        >
          <div className="text-gray-600 text-sm font-medium">
            {productData.id}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="text-white font-bold py-1.5 px-4 rounded-full flex items-center text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            disabled={isExporting}
            style={{ backgroundColor: "#7D5BC6" }}
          >
            <span className="mr-1">
              {isExporting ? "Exporting..." : "Export CSV"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Main content */}
        {!isMobile ? (
          // Desktop layout: side-by-side with equal heights and contained scrolling
          <div className="flex flex-1 h-[calc(100vh-180px)]">
            {/* Left Side - Results Panel */}
            <div
              className="w-1/4 border-r p-4 overflow-y-auto"
              style={{ borderColor: "#EDE4FF" }}
            >
              <ResultsSidebar
                productData={productData}
                onNavigate={handleNavigate}
                imageId={currentImage.image_id}
                albumId={currentImage.album_id}
              />
            </div>

            {/* Right Side - Image Gallery */}
            <div className="w-3/4 p-4 flex items-start justify-center overflow-hidden">
              <ImageGallery
                images={formatImagesForGallery()}
                onSelectImage={(id) => {
                  const index = uploadResult.images.findIndex(
                    (img) => img.image_id === id
                  );
                  if (index !== -1) {
                    setCurrentImageIndex(index);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          // Mobile layout: stacked with gallery on top
          <div className="flex flex-col overflow-y-auto no-scrollbar h-[calc(100vh-180px)]">
            {/* Top - Image Gallery */}
            <div className="p-2">
              <ImageGallery
                images={formatImagesForGallery()}
                onSelectImage={(id) => {
                  const index = uploadResult.images.findIndex(
                    (img) => img.image_id === id
                  );
                  if (index !== -1) {
                    setCurrentImageIndex(index);
                  }
                }}
              />
            </div>

            {/* Bottom - Results Panel */}
            <div
              className="border-t p-4 pb-8"
              style={{ borderColor: "#EDE4FF" }}
            >
              <ResultsSidebar
                productData={productData}
                onNavigate={handleNavigate}
                imageId={currentImage.image_id}
                albumId={currentImage.album_id}
              />
            </div>
          </div>
        )}
      </div>

      {/* Platform Selection Modal */}
      <PlatformSelectionModal
        isOpen={showPlatformModal}
        onClose={handleModalClose}
        onConfirm={handlePlatformConfirm}
        isLoading={isExporting}
        albumId={currentImage?.album_id}
        albumName={albumName}
        isMultiple={false}
      />
    </div>
  );
};

export default ResultPage;
