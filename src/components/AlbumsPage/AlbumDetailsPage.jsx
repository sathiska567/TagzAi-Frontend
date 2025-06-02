/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  Download,
  MoreVertical,
  Edit,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
  FileText,
} from "lucide-react";
import { fetchAlbumDetails, deleteAlbum } from "../../store/slices/albumSlice";
import { deleteImage, setCurrentImage } from "../../store/slices/imageSlice";
import { formatDistanceToNow } from "date-fns";
import PlatformSelectionModal from "../common/PlatformSelectionModal";
import imageService from "../../services/imageService";

function AlbumDetailsPage() {
  const { albumId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selectedAlbumDetails,
    isLoading: reduxLoading,
    error,
  } = useSelector((state) => state.albums);

  // Local loading state with minimum duration
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showDeleteAlbumConfirm, setShowDeleteAlbumConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  const [deleteType, setDeleteType] = useState(""); // "image" or "album"
  const [isProcessing, setIsProcessing] = useState(false);

  // Platform selection modal state
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Fetch album details on component mount with enforced minimum loading time
  useEffect(() => {
    if (albumId) {
      setIsLoading(true);
      const startTime = Date.now();

      dispatch(fetchAlbumDetails(albumId)).then(() => {
        // Ensure loading spinner shows for at least 1 second
        const elapsedTime = Date.now() - startTime;
        const minimumLoadingTime = 1000; // 1 second minimum

        if (elapsedTime < minimumLoadingTime) {
          const remainingTime = minimumLoadingTime - elapsedTime;
          setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        } else {
          setIsLoading(false);
        }
      });
    }
  }, [dispatch, albumId]);

  // Reset selected images when album changes
  useEffect(() => {
    setSelectedImages([]);
    setActiveDropdown(null);
  }, [albumId]);

  // Handle image selection
  const toggleImageSelection = (imageId, event) => {
    event.stopPropagation();
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter((id) => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  // Handle view image
  const handleViewImage = (image) => {
    dispatch(setCurrentImage(image));
    navigate(`/images/${image.image_id}`);
  };

  // Format creation date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Handle delete image click
  const handleDeleteImageClick = (imageId, event) => {
    event.stopPropagation();
    setImageToDelete(imageId);
    setDeleteType("image");
    setShowDeleteConfirm(true);
    setActiveDropdown(null);
  };

  // Handle delete album click
  const handleDeleteAlbumClick = () => {
    setDeleteType("album");
    setShowDeleteAlbumConfirm(true);
  };

  // Export keywords as CSV - Updated to use platform selection modal
  const handleExportCSV = async () => {
    if (!albumId) {
      showToast("Album ID not found. Cannot export keywords.", "error");
      return;
    }

    console.log("Opening platform modal for album:", albumId); // Debug log
    setShowPlatformModal(true);
  };

  // Handle platform selection and CSV download
  const handlePlatformConfirm = async (platform) => {
    console.log("Platform selected:", platform, "for album:", albumId); // Debug log

    if (!albumId) {
      showToast("Album ID not found. Cannot export keywords.", "error");
      setShowPlatformModal(false);
      return;
    }

    setIsExportingCSV(true);

    try {
      await imageService.downloadKeywordsCSV(albumId, platform);
      showToast(`Keywords CSV for ${platform} downloaded successfully`);
    } catch (error) {
      console.error("Failed to download CSV:", error);

      // Handle specific error messages
      let errorMessage = "Failed to download CSV. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsExportingCSV(false);
      setShowPlatformModal(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    console.log("Closing platform modal, isExportingCSV:", isExportingCSV); // Debug log
    if (!isExportingCSV) {
      setShowPlatformModal(false);
    }
  };

  // Confirm delete (image or album)
  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      if (deleteType === "image" && imageToDelete) {
        await dispatch(
          deleteImage({ imageId: imageToDelete, albumId })
        ).unwrap();
        // Refresh album details after deletion
        dispatch(fetchAlbumDetails(albumId));
        setSelectedImages(selectedImages.filter((id) => id !== imageToDelete));
        showToast("Image deleted successfully");
      } else if (deleteType === "selected" && selectedImages.length > 0) {
        // Delete all selected images one by one
        for (const imageId of selectedImages) {
          await dispatch(deleteImage({ imageId, albumId })).unwrap();
        }
        // Refresh album details after deletion
        dispatch(fetchAlbumDetails(albumId));
        setSelectedImages([]);
        showToast(`${selectedImages.length} images deleted successfully`);
      } else if (deleteType === "album") {
        await dispatch(deleteAlbum(albumId)).unwrap();
        navigate("/albums");
        showToast("Album deleted successfully");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Failed to delete. Please try again.", "error");
    } finally {
      setIsProcessing(false);
      setShowDeleteConfirm(false);
      setShowDeleteAlbumConfirm(false);
      setImageToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setShowDeleteAlbumConfirm(false);
    setImageToDelete(null);
  };

  // Handle deletion of selected images
  const handleDeleteSelected = () => {
    if (selectedImages.length > 0) {
      // If we're deleting multiple, set the first one to delete and confirm
      setDeleteType("selected");
      setShowDeleteConfirm(true);
    }
  };

  // Get album details
  const album =
    selectedAlbumDetails && selectedAlbumDetails.length > 0
      ? {
          id: albumId,
          name: selectedAlbumDetails[0]?.album_name || "Untitled Album",
          imageCount: selectedAlbumDetails.length,
          createdAt:
            selectedAlbumDetails[0]?.created_at || new Date().toISOString(),
        }
      : null;

  // Calculate pagination
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = selectedAlbumDetails
    ? selectedAlbumDetails.slice(indexOfFirstImage, indexOfLastImage)
    : [];
  const totalPages = selectedAlbumDetails
    ? Math.ceil(selectedAlbumDetails.length / imagesPerPage)
    : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Debug: Monitor modal state changes
  useEffect(() => {
    console.log("Platform modal state changed:", showPlatformModal);
  }, [showPlatformModal]);

  // Skeleton component for image cards
  const ImageCardSkeleton = () => (
    <div className="group relative rounded-xl overflow-hidden bg-white border border-gray-200 shadow-lg animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-square">
        <div className="w-full h-full bg-gray-100"></div>

        {/* Selection checkbox skeleton */}
        <div className="absolute top-2 left-2 z-10">
          <div className="w-6 h-6 rounded-full bg-gray-200"></div>
        </div>

        {/* Action menu skeleton */}
        <div className="absolute top-2 right-2 z-10">
          <div className="w-8 h-8 rounded-full bg-gray-100"></div>
        </div>
      </div>

      {/* Image info skeleton */}
      <div className="p-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-100 rounded w-2/3 mb-3"></div>

        {/* Keywords skeleton */}
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-12 bg-gray-100 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
          <div className="h-5 w-14 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  // If loading, show skeleton instead of spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 flex justify-center items-center">
        <div className="w-full max-w-6xl relative">
          {/* Back button and album header skeleton */}
          <div className="flex items-center mb-6 animate-pulse">
            <div className="mr-4 p-2 rounded-full bg-gray-100 w-10 h-10 shadow-sm"></div>

            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-96"></div>
            </div>

            <div className="flex space-x-2">
              <div className="h-8 w-24 bg-gray-100 rounded-lg shadow-sm"></div>
              <div className="h-8 w-20 bg-gray-100 rounded-lg shadow-sm"></div>
              <div className="h-8 w-24 bg-gray-100 rounded-lg shadow-sm"></div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200">
            <div className="p-6">
              {/* Images grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(12)].map((_, index) => (
                  <ImageCardSkeleton key={index} />
                ))}
              </div>

              {/* Pagination skeleton */}
              <div className="flex justify-center items-center space-x-4 pt-4 border-t border-gray-200 animate-pulse">
                <div className="h-8 w-8 bg-gray-100 rounded-lg shadow-sm"></div>

                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-lg shadow-sm ${
                        index === 2 ? "bg-gray-200" : "bg-gray-100"
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="h-8 w-8 bg-gray-100 rounded-lg shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 flex justify-center items-center">
      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg z-[100] transition-all duration-300 text-sm ${
            toast.type === "success" ? "bg-[#7D5BC6]" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-6xl relative">
        {/* Back button and album header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <button
            className="self-start p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black transition-colors shadow-lg"
            onClick={() => navigate("/albums")}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#7D5BC6] truncate">
              {album ? album.name : ""}
            </h1>
            {album && (
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                {album.imageCount} {album.imageCount === 1 ? "image" : "images"}{" "}
                • Created {formatDate(album.createdAt)}
                <span className="hidden sm:inline">
                  {" • "}
                  <span className="text-gray-500 text-xs">{albumId}</span>
                </span>
              </p>
            )}
          </div>

          {/* Mobile action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {selectedImages.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200 shadow-sm text-sm min-h-[44px]"
              >
                <Trash2 size={16} className="mr-1.5" />
                <span className="hidden sm:inline">
                  Delete {selectedImages.length} selected
                </span>
                <span className="sm:hidden">
                  Delete ({selectedImages.length})
                </span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleExportCSV();
              }}
              className="flex items-center justify-center px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black rounded-lg transition-colors shadow-lg text-sm min-h-[44px]"
              disabled={isExportingCSV}
            >
              <FileText size={16} className="mr-1.5" />
              {isExportingCSV ? "Exporting..." : "Export CSV"}
            </button>
            <button
              onClick={handleDeleteAlbumClick}
              className="flex items-center justify-center px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black rounded-lg transition-colors shadow-lg text-sm min-h-[44px]"
            >
              <Trash2 size={16} className="mr-1.5" />
              <span className="hidden sm:inline">Delete Album</span>
              <span className="sm:hidden">Delete</span>
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 transition-all duration-500 opacity-100 scale-100">
          <div className="p-4 sm:p-6">
            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-6 shadow-sm">
                <p>Error: {error}</p>
                <button
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-800 text-sm shadow-sm"
                  onClick={() => dispatch(fetchAlbumDetails(albumId))}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!error &&
              (!selectedAlbumDetails || selectedAlbumDetails.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-[#EDE4FF] rounded-full p-5 mb-4">
                    <Trash2 className="text-[#7D5BC6]" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">
                    No Images Found
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    This album doesn't contain any images or may have been
                    deleted.
                  </p>
                  <button
                    className="mt-4 px-4 py-2 bg-[#7D5BC6] hover:bg-[#6b4ba8] rounded-lg text-white shadow-lg transition-colors"
                    onClick={() => navigate("/albums")}
                  >
                    Back to Albums
                  </button>
                </div>
              )}

            {/* Images grid */}
            {!error &&
              selectedAlbumDetails &&
              selectedAlbumDetails.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {currentImages.map((image) => (
                      <div
                        key={image.image_id}
                        className={`group relative rounded-xl overflow-hidden bg-white border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg ${
                          selectedImages.includes(image.image_id)
                            ? "border-[#7D5BC6] shadow-[#7D5BC6]/20"
                            : "border-gray-200 hover:border-[#7D5BC6]"
                        }`}
                        onClick={() => handleViewImage(image)}
                      >
                        {/* Image */}
                        <div className="relative aspect-square">
                          <img
                            src={image.image_link}
                            alt={image.title || "Image"}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Selection checkbox */}
                          <div
                            className="absolute top-2 left-2 z-10"
                            onClick={(e) =>
                              toggleImageSelection(image.image_id, e)
                            }
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                                selectedImages.includes(image.image_id)
                                  ? "bg-[#7D5BC6] border-[#7D5BC6]"
                                  : "bg-white/80 border-gray-300 opacity-70 group-hover:opacity-100"
                              }`}
                            >
                              {selectedImages.includes(image.image_id) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                          </div>

                          {/* Action menu */}
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              className="w-8 h-8 rounded-full bg-white/80 text-gray-700 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300 border border-gray-200 shadow-sm"
                              onClick={(e) => toggleDropdown(image.image_id, e)}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeDropdown === image.image_id && (
                              <div className="absolute right-0 top-10 z-50 w-48 py-1.5 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-2xl transition-all duration-300 animate-fadeIn">
                                <div className="flex flex-col divide-y divide-gray-100">
                                  <button
                                    className="flex items-center px-4 py-3 hover:bg-[#EDE4FF] text-gray-700 text-left cursor-pointer transition-all duration-300"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewImage(image);
                                    }}
                                  >
                                    <ExternalLink
                                      size={16}
                                      className="mr-3 text-gray-500"
                                    />
                                    View image
                                  </button>
                                  <button className="flex items-center px-4 py-3 hover:bg-[#EDE4FF] text-gray-700 text-left cursor-pointer transition-all duration-300">
                                    <Download
                                      size={16}
                                      className="mr-3 text-gray-500"
                                    />
                                    Download
                                  </button>
                                  <button className="flex items-center px-4 py-3 hover:bg-[#EDE4FF] text-gray-700 text-left cursor-pointer transition-all duration-300">
                                    <Edit
                                      size={16}
                                      className="mr-3 text-gray-500"
                                    />
                                    Edit tags
                                  </button>
                                  <button
                                    className="flex items-center px-4 py-3 hover:bg-red-50 text-gray-700 text-left cursor-pointer transition-all duration-300"
                                    onClick={(e) =>
                                      handleDeleteImageClick(image.image_id, e)
                                    }
                                  >
                                    <Trash2
                                      size={16}
                                      className="mr-3 text-red-500"
                                    />
                                    <span className="text-red-500">Delete</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Image info */}
                        <div className="p-3">
                          <h3 className="text-black font-medium line-clamp-1 text-sm sm:text-base">
                            {image.title || "Untitled Image"}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mt-1">
                            {image.description?.substring(0, 100) ||
                              "No description"}
                          </p>

                          {/* Keywords */}
                          {image.keywords && image.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                              {image.keywords
                                .slice(0, 3)
                                .map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-[#EDE4FF] border border-gray-200 rounded-full text-xs text-gray-700"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              {image.keywords.length > 3 && (
                                <span className="px-2 py-0.5 bg-[#EDE4FF] border border-gray-200 rounded-full text-xs text-gray-700">
                                  +{image.keywords.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`p-3 rounded-lg min-h-[44px] min-w-[44px] ${
                          currentPage > 1
                            ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                            : "bg-gray-100 cursor-not-allowed border border-gray-200"
                        } transition-all duration-300`}
                      >
                        <ChevronLeft
                          size={18}
                          className={`${
                            currentPage > 1 ? "text-gray-700" : "text-gray-400"
                          }`}
                        />
                      </button>

                      <div className="flex items-center flex-wrap justify-center gap-2">
                        {[...Array(totalPages)].map((_, idx) => {
                          // Mobile: show fewer pages
                          const isMobile = window.innerWidth < 640;
                          const maxVisiblePages = isMobile ? 3 : 5;

                          if (totalPages <= maxVisiblePages) {
                            return (
                              <button
                                key={idx}
                                onClick={() => setCurrentPage(idx + 1)}
                                className={`w-10 h-10 sm:w-8 sm:h-8 mx-1 rounded-lg flex items-center justify-center text-sm ${
                                  currentPage === idx + 1
                                    ? "bg-[#7D5BC6] text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                                } transition-all duration-300`}
                              >
                                {idx + 1}
                              </button>
                            );
                          }

                          // Otherwise, show first, last, current, and surrounding pages
                          const pageNum = idx + 1;

                          // Always show first and last pages
                          if (pageNum === 1 || pageNum === totalPages) {
                            return (
                              <button
                                key={idx}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 sm:w-8 sm:h-8 mx-1 rounded-lg flex items-center justify-center text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[#7D5BC6] text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                                } transition-all duration-300`}
                              >
                                {pageNum}
                              </button>
                            );
                          }

                          // Show current page and adjacent pages
                          if (
                            pageNum === currentPage ||
                            pageNum === currentPage - 1 ||
                            pageNum === currentPage + 1
                          ) {
                            return (
                              <button
                                key={idx}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 sm:w-8 sm:h-8 mx-1 rounded-lg flex items-center justify-center text-sm ${
                                  currentPage === pageNum
                                    ? "bg-[#7D5BC6] text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                                } transition-all duration-300`}
                              >
                                {pageNum}
                              </button>
                            );
                          }

                          // Show ellipsis when needed (hide on mobile)
                          if (
                            !isMobile &&
                            ((pageNum === 2 && currentPage > 3) ||
                              (pageNum === totalPages - 1 &&
                                currentPage < totalPages - 2))
                          ) {
                            return (
                              <span
                                key={idx}
                                className="text-gray-500 mx-1 hidden sm:inline"
                              >
                                ...
                              </span>
                            );
                          }

                          return null;
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`p-3 rounded-lg min-h-[44px] min-w-[44px] ${
                          currentPage < totalPages
                            ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                            : "bg-gray-100 cursor-not-allowed border border-gray-200"
                        } transition-all duration-300`}
                      >
                        <ChevronRight
                          size={18}
                          className={`${
                            currentPage < totalPages
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
          </div>
        </div>
      </div>

      {/* Platform Selection Modal */}
      <PlatformSelectionModal
        isOpen={showPlatformModal}
        onClose={handleModalClose}
        onConfirm={handlePlatformConfirm}
        isLoading={isExportingCSV}
        albumId={albumId}
        albumName={album?.name || `Album ${albumId?.substring(0, 8)}`}
        isMultiple={false}
      />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={cancelDelete}
          ></div>
          <div className="relative max-w-md w-full transform transition-all duration-300 animate-scaleIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
              <div className="p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  {deleteType === "selected"
                    ? `Are you sure you want to delete ${selectedImages.length} selected images? This action cannot be undone.`
                    : "Are you sure you want to delete this image? This action cannot be undone."}
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 shadow-sm text-center min-h-[44px]"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center justify-center shadow-lg min-h-[44px]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete album confirmation modal */}
      {showDeleteAlbumConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={cancelDelete}
          ></div>
          <div className="relative max-w-md w-full transform transition-all duration-300 animate-scaleIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
              <div className="p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                  Delete Album
                </h3>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">
                  Are you sure you want to delete this entire album and all its
                  contents? This action cannot be undone.
                </p>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 mb-6">
                  <div className="flex items-center text-red-700">
                    <div className="mr-3 p-2 bg-red-100 rounded-full flex-shrink-0">
                      <Trash2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{album?.name}</p>
                      <p className="text-sm">
                        {album?.imageCount || 0} images will be permanently
                        deleted
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 shadow-sm text-center min-h-[44px]"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center justify-center shadow-lg min-h-[44px]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Delete Album"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add keyframes for animations */}
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

        .animation-delay-150 {
          animation-delay: 150ms;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}

export default AlbumDetailsPage;
