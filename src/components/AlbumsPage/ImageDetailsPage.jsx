/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  Edit,
  Save,
  X,
  PlusCircle,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import {
  deleteImage,
  deleteKeyword,
  addKeyword,
  updateImageTitle,
  updateImageDescription,
  regenerateTags,
  setCurrentImage,
} from "../../store/slices/imageSlice";
import { fetchAlbumDetails } from "../../store/slices/albumSlice";
import { formatDistanceToNow } from "date-fns";

function ImageDetailsPage() {
  const { imageId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedAlbumDetails } = useSelector((state) => state.albums);
  const { isUploading, error } = useSelector((state) => state.images);

  const [currentImage, setCurrentImageState] = useState(null);
  const [albumId, setAlbumId] = useState(null); // Store album ID separately for navigation
  const [imageIndex, setImageIndex] = useState(0);
  const [editMode, setEditMode] = useState({
    title: false,
    description: false,
  });
  const [editedValues, setEditedValues] = useState({
    title: "",
    description: "",
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Get album ID from URL if we came from an album page
  useEffect(() => {
    // This gets the previous URL path if available
    const referrer = document.referrer;
    if (referrer && referrer.includes("/albums/")) {
      const albumIdFromUrl = referrer.split("/albums/")[1].split("/")[0];
      if (albumIdFromUrl) {
        setAlbumId(albumIdFromUrl);
        localStorage.setItem(`image_${imageId}_albumId`, albumIdFromUrl);
      }
    }
  }, [imageId]);

  // Check if we need to fetch album details
  useEffect(() => {
    if (imageId) {
      // Always try to get album ID from localStorage first
      const cachedAlbumId = localStorage.getItem(`image_${imageId}_albumId`);

      if (cachedAlbumId) {
        setAlbumId(cachedAlbumId);

        // If we don't have album details or they're empty, fetch them
        if (!selectedAlbumDetails || selectedAlbumDetails.length === 0) {
          dispatch(fetchAlbumDetails(cachedAlbumId));
        }
      }
    }
  }, [imageId, selectedAlbumDetails, dispatch]);

  // Find the current image and its index in the album with enforced minimum loading time
  useEffect(() => {
    setIsLoading(true);
    const startTime = Date.now();

    const findImage = () => {
      if (selectedAlbumDetails && selectedAlbumDetails.length > 0 && imageId) {
        const index = selectedAlbumDetails.findIndex(
          (img) => img.image_id === imageId
        );
        if (index !== -1) {
          const foundImage = selectedAlbumDetails[index];
          setCurrentImageState(foundImage);
          setImageIndex(index);

          // Store album ID separately for navigation and cache it
          if (foundImage.album_id) {
            setAlbumId(foundImage.album_id);
            localStorage.setItem(
              `image_${imageId}_albumId`,
              foundImage.album_id
            );
          }

          setEditedValues({
            title: foundImage.title || "",
            description: foundImage.description || "",
          });

          // Apply minimum loading time
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
        } else {
          // If the image isn't in the current album details
          setTimeout(() => {
            setIsLoading(false);
          }, 500); // Add a slight delay for better UX
        }
      } else if (!selectedAlbumDetails || selectedAlbumDetails.length === 0) {
        // We need to check if we can find the image by directly requesting it
        // This would require an API to fetch a single image by ID
        // For now, we'll just set isLoading to false after a delay
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    findImage();

    // Cleanup function to clear any intervals
    return () => {
      const allIntervals = window.setInterval(function () {}, 0) - 1;
      for (let i = 0; i <= allIntervals; i++) {
        clearInterval(i);
      }
    };
  }, [selectedAlbumDetails, imageId]);

  // Handle navigation back to album
  const handleBackToAlbum = () => {
    // First check if we have an albumId in state
    if (albumId) {
      navigate(`/albums/${albumId}`);
      return;
    }

    // Then try to use the album ID from current image
    if (currentImage && currentImage.album_id) {
      navigate(`/albums/${currentImage.album_id}`);
      return;
    }

    // Then try to get from localStorage as a final fallback
    const cachedAlbumId = localStorage.getItem(`image_${imageId}_albumId`);
    if (cachedAlbumId) {
      navigate(`/albums/${cachedAlbumId}`);
      return;
    }

    // Last resort, go to albums list
    navigate("/albums");
    console.warn(
      "Album ID not available for navigation, redirecting to albums list"
    );
  };

  // Handle image deletion
  const handleDeleteImage = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm delete image
  const confirmDelete = async () => {
    if (currentImage) {
      setIsProcessing(true);
      const navigateToAlbumId =
        currentImage.album_id ||
        albumId ||
        localStorage.getItem(`image_${imageId}_albumId`);

      try {
        await dispatch(
          deleteImage({
            imageId: currentImage.image_id,
            albumId: navigateToAlbumId,
          })
        ).unwrap();
        showToast("Image deleted successfully");

        // Navigate back to album details
        if (navigateToAlbumId) {
          navigate(`/albums/${navigateToAlbumId}`);
        } else {
          navigate("/albums");
        }
      } catch (error) {
        console.error("Failed to delete image:", error);
        showToast("Failed to delete image", "error");
      } finally {
        setIsProcessing(false);
        setShowDeleteConfirm(false);
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setShowRegenerateConfirm(false);
  };

  // Navigate to previous/next image in album
  const navigateImages = (direction) => {
    if (!selectedAlbumDetails || selectedAlbumDetails.length <= 1) return;

    let newIndex;
    if (direction === "prev") {
      newIndex =
        imageIndex <= 0 ? selectedAlbumDetails.length - 1 : imageIndex - 1;
    } else {
      newIndex =
        imageIndex >= selectedAlbumDetails.length - 1 ? 0 : imageIndex + 1;
    }

    const newImage = selectedAlbumDetails[newIndex];
    navigate(`/images/${newImage.image_id}`);
  };

  // Toggle edit mode for title/description
  const toggleEditMode = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    // Reset edited value if canceling edit
    if (editMode[field]) {
      setEditedValues((prev) => ({
        ...prev,
        [field]: currentImage[field] || "",
      }));
    }
  };

  // Save edited title
  const saveTitle = async () => {
    if (currentImage && editedValues.title.trim() !== currentImage.title) {
      setIsProcessing(true);
      try {
        await dispatch(
          updateImageTitle({
            imageId: currentImage.image_id,
            title: editedValues.title,
          })
        ).unwrap();
        showToast("Title updated successfully");
        setCurrentImageState((prev) => ({
          ...prev,
          title: editedValues.title,
        }));
      } catch (error) {
        console.error("Failed to update title:", error);
        showToast("Failed to update title", "error");
      } finally {
        setIsProcessing(false);
        toggleEditMode("title");
      }
    } else {
      toggleEditMode("title");
    }
  };

  // Save edited description
  const saveDescription = async () => {
    if (
      currentImage &&
      editedValues.description.trim() !== currentImage.description
    ) {
      setIsProcessing(true);
      try {
        await dispatch(
          updateImageDescription({
            imageId: currentImage.image_id,
            description: editedValues.description,
          })
        ).unwrap();
        showToast("Description updated successfully");
        setCurrentImageState((prev) => ({
          ...prev,
          description: editedValues.description,
        }));
      } catch (error) {
        console.error("Failed to update description:", error);
        showToast("Failed to update description", "error");
      } finally {
        setIsProcessing(false);
        toggleEditMode("description");
      }
    } else {
      toggleEditMode("description");
    }
  };

  // Add new keyword
  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || isAddingKeyword) return;

    setIsAddingKeyword(true);

    try {
      const currentAlbumId =
        currentImage.album_id ||
        albumId ||
        localStorage.getItem(`image_${imageId}_albumId`);

      await dispatch(
        addKeyword({
          keyword_name: newKeyword.trim(),
          image_id: currentImage.image_id,
          album_id: currentAlbumId,
        })
      ).unwrap();

      showToast("Keyword added successfully");
      // Update local state
      setCurrentImageState((prev) => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()],
      }));
      setNewKeyword("");
    } catch (error) {
      console.error("Error adding keyword:", error);
      showToast("Failed to add keyword", "error");
    } finally {
      setIsAddingKeyword(false);
    }
  };

  // Delete keyword
  const handleDeleteKeyword = async (keyword) => {
    setIsProcessing(true);
    try {
      const currentAlbumId =
        currentImage.album_id ||
        albumId ||
        localStorage.getItem(`image_${imageId}_albumId`);

      await dispatch(
        deleteKeyword({
          keyword_name: keyword,
          image_id: currentImage.image_id,
          album_id: currentAlbumId,
        })
      ).unwrap();

      showToast("Keyword removed successfully");
      // Update local state
      setCurrentImageState((prev) => ({
        ...prev,
        keywords: prev.keywords.filter((k) => k !== keyword),
      }));
    } catch (error) {
      console.error("Error removing keyword:", error);
      showToast("Failed to remove keyword", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate tags
  const handleRegenerateTags = () => {
    setShowRegenerateConfirm(true);
  };

  // Confirm regenerate tags
  const confirmRegenerate = async () => {
    if (currentImage) {
      setIsProcessing(true);
      try {
        const result = await dispatch(
          regenerateTags({
            imageId: currentImage.image_id,
            prompt: "",
          })
        ).unwrap();

        showToast("Tags regenerated successfully");
        // Update local state with new tags from the response
        if (result && result.keywords) {
          setCurrentImageState((prev) => ({
            ...prev,
            keywords: result.keywords,
          }));
        }
      } catch (error) {
        console.error("Failed to regenerate tags:", error);
        showToast("Failed to regenerate tags", "error");
      } finally {
        setIsProcessing(false);
        setShowRegenerateConfirm(false);
      }
    }
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

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-6xl relative">
          {/* Back button and navigation skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 animate-pulse">
            <div className="self-start p-3 rounded-full bg-gray-100 w-12 h-12 shadow-sm"></div>

            <div className="flex-1 min-w-0">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-100 rounded w-48 sm:w-64"></div>
            </div>

            <div className="flex gap-2 self-start sm:self-auto">
              <div className="h-12 w-12 bg-gray-100 rounded-full shadow-sm"></div>
              <div className="h-12 w-12 bg-gray-100 rounded-full shadow-sm"></div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Image preview skeleton */}
            <div className="lg:w-1/2 animate-pulse">
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative">
                <div className="relative aspect-square bg-gray-100"></div>

                <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="h-11 w-11 bg-gray-100 rounded-full"></div>
                    <div className="h-11 w-11 bg-gray-100 rounded-full"></div>
                    <div className="h-11 w-11 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image details skeleton */}
            <div className="lg:w-1/2 animate-pulse">
              <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl relative">
                <div className="p-4 sm:p-6">
                  {/* Title section skeleton */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-11 w-11 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>

                  {/* Description section skeleton */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-11 w-11 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>

                  {/* Keywords section skeleton */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-4 bg-gray-200 rounded w-18"></div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
                        <div className="h-4 w-12 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex items-center px-3 py-2 bg-gray-100 rounded-full">
                        <div className="h-4 w-14 bg-gray-200 rounded"></div>
                      </div>
                    </div>

                    {/* Add keyword input skeleton */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 h-12 bg-gray-100 rounded-lg"></div>
                      <div className="h-12 w-full sm:w-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentImage) {
    return (
      <div className="min-h-screen bg-white p-8 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 shadow-lg">
            <h2 className="text-xl font-bold mb-2">Image Not Found</h2>
            <p>
              The requested image could not be found. It may have been deleted
              or you don't have permission to view it.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              onClick={() => navigate("/albums")}
            >
              Back to Albums
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 flex justify-center">
      {/* Toast notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg z-50 transition-all duration-300 text-sm ${
            toast.type === "success" ? "bg-[#7D5BC6]" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-6xl relative">
        {/* Back button and navigation - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 relative z-20">
          <button
            className="self-start p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black transition-colors cursor-pointer shadow-lg"
            onClick={handleBackToAlbum}
            style={{ position: "relative", zIndex: 30 }}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#7D5BC6] truncate">
              Image Details
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              From album • Created {formatDate(currentImage.created_at)}
            </p>
          </div>

          <div
            className="flex gap-2 self-start sm:self-auto"
            style={{ position: "relative", zIndex: 30 }}
          >
            <button
              onClick={() => navigateImages("prev")}
              className="p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black transition-colors cursor-pointer shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              disabled={selectedAlbumDetails?.length <= 1}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateImages("next")}
              className="p-3 rounded-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black transition-colors cursor-pointer shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              disabled={selectedAlbumDetails?.length <= 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Image preview */}
          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative">
              <div className="relative aspect-square bg-white">
                <img
                  src={currentImage.image_link}
                  alt={currentImage.title || "Image"}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white relative z-10">
                <div className="text-black text-xs sm:text-sm min-w-0">
                  <span className="font-medium">Image ID:</span>{" "}
                  <span className="text-gray-600 break-all">
                    {currentImage.image_id}
                  </span>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className="p-2 rounded-full hover:bg-[#EDE4FF] text-gray-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Download image"
                  >
                    <Download size={18} />
                  </button>
                  <a
                    href={currentImage.image_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-[#EDE4FF] text-gray-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Open in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button
                    onClick={handleDeleteImage}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Delete image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image details */}
          <div className="lg:w-1/2">
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl relative">
              <div className="p-4 sm:p-6">
                {/* Title */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-xs sm:text-sm uppercase tracking-wider">
                      Title
                    </h3>
                    {!editMode.title ? (
                      <button
                        onClick={() => toggleEditMode("title")}
                        className="p-2 rounded-full hover:bg-[#EDE4FF] text-gray-600 hover:text-black transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ position: "relative", zIndex: 20 }}
                      >
                        <Edit size={16} />
                      </button>
                    ) : (
                      <div
                        className="flex gap-1"
                        style={{ position: "relative", zIndex: 20 }}
                      >
                        <button
                          onClick={saveTitle}
                          className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => toggleEditMode("title")}
                          className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          disabled={isProcessing}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.title ? (
                    <p className="text-black text-base sm:text-lg break-words">
                      {currentImage.title || (
                        <span className="text-gray-500 italic">No title</span>
                      )}
                    </p>
                  ) : (
                    <input
                      type="text"
                      value={editedValues.title}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-gray-200 text-black p-3 rounded-lg focus:border-[#7D5BC6] focus:outline-none relative z-10 shadow-sm text-base"
                      placeholder="Enter a title for this image"
                      disabled={isProcessing}
                    />
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 text-xs sm:text-sm uppercase tracking-wider">
                      Description
                    </h3>
                    {!editMode.description ? (
                      <button
                        onClick={() => toggleEditMode("description")}
                        className="p-2 rounded-full hover:bg-[#EDE4FF] text-gray-600 hover:text-black transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ position: "relative", zIndex: 20 }}
                      >
                        <Edit size={16} />
                      </button>
                    ) : (
                      <div
                        className="flex gap-1"
                        style={{ position: "relative", zIndex: 20 }}
                      >
                        <button
                          onClick={saveDescription}
                          className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => toggleEditMode("description")}
                          className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          disabled={isProcessing}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {!editMode.description ? (
                    <p className="text-gray-700 text-sm sm:text-base break-words">
                      {currentImage.description || (
                        <span className="text-gray-500 italic">
                          No description
                        </span>
                      )}
                    </p>
                  ) : (
                    <textarea
                      value={editedValues.description}
                      onChange={(e) =>
                        setEditedValues((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-gray-200 text-black p-3 rounded-lg focus:border-[#7D5BC6] focus:outline-none min-h-[120px] resize-none relative z-10 shadow-sm text-base"
                      placeholder="Enter a description for this image"
                      disabled={isProcessing}
                    />
                  )}
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-600 text-xs sm:text-sm uppercase tracking-wider">
                      Keywords
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                    {currentImage.keywords &&
                    currentImage.keywords.length > 0 ? (
                      currentImage.keywords.map((keyword, idx) => (
                        <div
                          key={idx}
                          className="flex items-center px-3 py-2 bg-[#EDE4FF] hover:bg-[#7D5BC6]/20 text-gray-700 rounded-full border border-gray-200 transition-colors group relative z-10"
                        >
                          <span className="text-sm">{keyword}</span>
                          <button
                            onClick={() => handleDeleteKeyword(keyword)}
                            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-600 transition-all cursor-pointer min-h-[24px] min-w-[24px] flex items-center justify-center"
                            disabled={isProcessing}
                            style={{ position: "relative", zIndex: 20 }}
                          >
                            {isProcessing ? (
                              <Loader size={14} className="animate-spin" />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm">
                        No keywords
                      </p>
                    )}
                  </div>

                  {/* Add keyword input */}
                  <div className="flex flex-col sm:flex-row gap-2 relative z-10">
                    <input
                      type="text"
                      placeholder="Add a new keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      className="flex-1 bg-white text-black p-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-gray-200 focus:border-[#7D5BC6] focus:outline-none shadow-sm text-base"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddKeyword()
                      }
                      disabled={isAddingKeyword}
                    />
                    <button
                      onClick={handleAddKeyword}
                      disabled={!newKeyword.trim() || isAddingKeyword}
                      className={`px-4 py-3 rounded-lg sm:rounded-l-none sm:rounded-r-lg border border-gray-200 cursor-pointer shadow-sm min-h-[48px] flex items-center justify-center ${
                        !newKeyword.trim() || isAddingKeyword
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#7D5BC6] hover:bg-[#6b4ba8] text-white"
                      } transition-colors`}
                      style={{ position: "relative", zIndex: 20 }}
                    >
                      {isAddingKeyword ? (
                        <div className="w-5 h-5 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                      ) : (
                        <PlusCircle size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                  Are you sure you want to delete this image? This action cannot
                  be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 cursor-pointer shadow-sm text-center min-h-[44px]"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg min-h-[44px]"
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

      {/* Regenerate tags confirmation modal */}
      {showRegenerateConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={cancelDelete}
          ></div>
          <div className="relative max-w-md w-full transform transition-all duration-300 animate-scaleIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
              <div className="p-4 sm:p-6 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                  Regenerate Tags
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  This will replace all existing keywords with new AI-generated
                  tags. Are you sure you want to continue?
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 cursor-pointer shadow-sm text-center min-h-[44px]"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRegenerate}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-[#7D5BC6] hover:bg-[#6b4ba8] text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg min-h-[44px]"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Regenerate"
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

export default ImageDetailsPage;
