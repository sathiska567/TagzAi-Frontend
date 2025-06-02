/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  X,
  Download,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check,
  FileText,
  Info,
  Loader,
  Grid,
  List,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  fetchAlbumsWithDetails,
  deleteAlbum,
  selectAlbum,
} from "../../store/slices/albumSlice";
import SearchBar from "./SearchBar";
import PlatformSelectionModal from "../common/PlatformSelectionModal";
import imageService from "../../services/imageService";

function AlbumsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    albumsWithDetails,
    isLoading: reduxLoading,
    error,
  } = useSelector((state) => state.albums);

  // View mode state for different layouts
  const [viewMode, setViewMode] = useState("auto"); // auto, grid, list
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Local loading state with minimum duration
  const [isLoading, setIsLoading] = useState(true);
  const [displayIds, setDisplayIds] = useState(true);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);
  const [page, setPage] = useState(1);

  // Dynamic albums per page based on screen size
  const [albumsPerPage, setAlbumsPerPage] = useState(() => {
    if (window.innerWidth < 640) return 3; // mobile
    if (window.innerWidth < 1024) return 5; // tablet
    return 8; // desktop
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Platform selection modal state
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    albumId: null,
    albumName: null,
    isMultiple: false,
    selectedAlbumIds: [],
  });
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    searchInTitles: true,
    searchInDescriptions: true,
    searchInKeywords: true,
    searchInDates: false,
  });
  const [filteredAlbums, setFilteredAlbums] = useState([]);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

      // Adjust albums per page based on screen size
      if (width < 640) {
        setAlbumsPerPage(3);
      } else if (width < 1024) {
        setAlbumsPerPage(5);
      } else if (width < 1440) {
        setAlbumsPerPage(8);
      } else {
        setAlbumsPerPage(10);
      }

      // Reset to first page when changing screen size
      setPage(1);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch albums on component mount with enforced minimum loading time
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      await dispatch(fetchAlbumsWithDetails());

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
    };

    fetchData();
  }, [dispatch]);

  // Update filtered albums when albums data or search parameters change
  useEffect(() => {
    if (!albumsWithDetails) {
      setFilteredAlbums([]);
      return;
    }

    if (!searchTerm) {
      setFilteredAlbums(albumsWithDetails);
      setNoResultsFound(false);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = albumsWithDetails.filter((album) => {
      // Search in album name
      if (
        searchFilters.searchInTitles &&
        album.album_name &&
        album.album_name.toLowerCase().includes(searchTermLower)
      ) {
        return true;
      }

      // Search in dates
      if (searchFilters.searchInDates && album.created_at) {
        const dateStr = formatDistanceToNow(new Date(album.created_at), {
          addSuffix: true,
        });
        if (dateStr.toLowerCase().includes(searchTermLower)) {
          return true;
        }
      }

      // Search in images descriptions and keywords
      if (album.images && album.images.length > 0) {
        // Search in descriptions
        if (searchFilters.searchInDescriptions) {
          const hasMatchingDescription = album.images.some(
            (image) =>
              image.description &&
              image.description.toLowerCase().includes(searchTermLower)
          );
          if (hasMatchingDescription) return true;
        }

        // Search in keywords
        if (searchFilters.searchInKeywords) {
          const hasMatchingKeywords = album.images.some(
            (image) =>
              image.keywords &&
              image.keywords.some((keyword) =>
                keyword.toLowerCase().includes(searchTermLower)
              )
          );
          if (hasMatchingKeywords) return true;
        }
      }

      return false;
    });

    setFilteredAlbums(filtered);
    setNoResultsFound(filtered.length === 0);

    // Reset to first page when search results change
    setPage(1);
  }, [albumsWithDetails, searchTerm, searchFilters]);

  // Show toast message
  const showToast = (message, type = "success") => {
    setToastMessage({ show: true, message, type });
    setTimeout(() => {
      setToastMessage({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Handle search
  const handleSearch = (term, filters) => {
    setSearchTerm(term);
    setSearchFilters(filters);
  };

  // Toggle dropdown menu for album actions
  const toggleDropdown = (id, e) => {
    if (e) e.stopPropagation();

    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // Handle album deletion process
  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setAlbumToDelete(id);
    setShowConfirmDelete(true);
    setActiveDropdown(null);
  };

  // Download keywords as CSV for a single album - Updated to use modal
  const handleDownloadCSV = async (albumId, e) => {
    if (e) e.stopPropagation();
    setActiveDropdown(null);

    // Find album name
    const album = albumsWithDetails.find((a) => a.album_id === albumId);
    const albumName = album?.album_name || `Album ${albumId.substring(0, 8)}`;

    setModalConfig({
      albumId,
      albumName,
      isMultiple: false,
      selectedAlbumIds: [albumId],
    });
    setShowPlatformModal(true);
  };

  // Download keywords as CSV for multiple selected albums - Updated to use modal
  const handleDownloadSelectedCSV = async () => {
    if (selectedAlbums.length === 0) {
      showToast("Please select at least one album first", "error");
      return;
    }

    setModalConfig({
      albumId: null,
      albumName: null,
      isMultiple: true,
      selectedAlbumIds: selectedAlbums,
    });
    setShowPlatformModal(true);
  };

  // Handle platform selection and CSV download
  const handlePlatformConfirm = async (platform) => {
    const { isMultiple, selectedAlbumIds, albumId, albumName } = modalConfig;

    setIsDownloadingCSV(true);

    try {
      if (isMultiple) {
        // Handle multiple albums
        setDownloadProgress({ current: 0, total: selectedAlbumIds.length });

        // Show initial progress message
        showToast(
          `Starting download of ${selectedAlbumIds.length} CSV files for ${platform}...`,
          "success"
        );

        // Progress callback to update the progress state
        const onProgress = (progress) => {
          console.log("Download progress:", progress); // Debug log
          setDownloadProgress({
            current: progress.current,
            total: progress.total,
          });
        };

        const result = await imageService.downloadMultipleAlbumsCSV(
          selectedAlbumIds,
          platform,
          onProgress
        );

        if (result.failed > 0) {
          const errorMessages = result.errors
            .map((e) => `Album ${e.albumId.substring(0, 8)}: ${e.error}`)
            .join("\n");

          showToast(
            `Downloaded ${result.successful}/${result.total} files successfully. ${result.failed} failed:\n${errorMessages}`,
            "error"
          );
        } else {
          showToast(
            `Successfully downloaded ${result.successful} CSV files for ${platform}!`
          );
        }

        // Show completion progress for a moment before closing
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        // Handle single album
        await imageService.downloadKeywordsCSV(
          albumId || selectedAlbumIds[0],
          platform
        );
        showToast(`Keywords CSV for ${platform} downloaded successfully`);
      }
    } catch (error) {
      console.error("Failed to download CSV:", error);

      // Handle specific error messages
      let errorMessage = "Failed to download CSV. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setIsDownloadingCSV(false);
      setDownloadProgress({ current: 0, total: 0 });
      setShowPlatformModal(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    if (!isDownloadingCSV) {
      setShowPlatformModal(false);
      setModalConfig({
        albumId: null,
        albumName: null,
        isMultiple: false,
        selectedAlbumIds: [],
      });
    }
  };

  // Confirm album deletion
  const confirmDelete = async () => {
    if (albumToDelete) {
      setIsProcessing(true);
      try {
        await dispatch(deleteAlbum(albumToDelete)).unwrap();
        setSelectedAlbums(selectedAlbums.filter((id) => id !== albumToDelete));
        showToast("Album deleted successfully");
      } catch (error) {
        console.error("Failed to delete album:", error);
        showToast("Failed to delete album. Please try again.", "error");
      } finally {
        setIsProcessing(false);
        setShowConfirmDelete(false);
        setAlbumToDelete(null);
      }
    }
  };

  // Cancel album deletion
  const cancelDelete = () => {
    setShowConfirmDelete(false);
    setAlbumToDelete(null);
  };

  // Handle checkbox selection
  const handleCheckboxChange = (albumId, isChecked) => {
    if (isChecked) {
      setSelectedAlbums([...selectedAlbums, albumId]);
    } else {
      setSelectedAlbums(selectedAlbums.filter((id) => id !== albumId));
    }
  };

  // Handle "select all" checkbox
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allAlbumIds = currentAlbums.map((album) => album.album_id);
      setSelectedAlbums(allAlbumIds);
    } else {
      setSelectedAlbums([]);
    }
  };

  // Handle deletion of selected albums
  const handleDeleteSelected = () => {
    if (selectedAlbums.length > 0) {
      // If we're deleting multiple, set the first one to delete and confirm
      setAlbumToDelete(selectedAlbums[0]);
      setShowConfirmDelete(true);
    }
  };

  // Navigate to album details
  const handleAlbumClick = (albumId) => {
    dispatch(selectAlbum(albumId));
    // Use React Router navigation instead of directly changing window.location
    navigate(`/albums/${albumId}`);
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

  // Determine current view mode
  const getCurrentViewMode = () => {
    if (viewMode === "auto") {
      return isMobile ? "grid" : "list";
    }
    return viewMode;
  };

  // Pagination logic
  const indexOfLastAlbum = page * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = filteredAlbums.slice(
    indexOfFirstAlbum,
    indexOfLastAlbum
  );
  const totalPages = Math.ceil(filteredAlbums.length / albumsPerPage);

  // Handle pagination
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

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

  // Helper to get a preview of the first image in an album
  const getAlbumPreview = (album) => {
    if (album.images && album.images.length > 0) {
      return album.images[0].image_link;
    }
    return null;
  };

  // Helper to get all keywords from an album's images
  const getAllKeywords = (album) => {
    if (!album.images) return [];

    const allKeywords = [];
    album.images.forEach((image) => {
      if (image.keywords) {
        image.keywords.forEach((keyword) => {
          if (!allKeywords.includes(keyword)) {
            allKeywords.push(keyword);
          }
        });
      }
    });

    // Return maximum keywords based on screen size
    const maxKeywords = isMobile ? 3 : 5;
    return allKeywords.slice(0, maxKeywords);
  };

  // Skeleton component for loading state
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-2 sm:p-4">
        <div className="flex items-center justify-center">
          <div className="h-4 w-4 bg-gray-100 rounded"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-gray-100 mr-2 sm:mr-4"></div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="h-3 bg-gray-100 rounded w-12 sm:w-16 mb-1"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-32 mb-1"></div>
            <div className="h-2 sm:h-3 bg-gray-100 rounded w-24 sm:w-48"></div>
          </div>
        </div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex justify-center">
          <div className="h-5 sm:h-6 w-6 sm:w-8 bg-gray-100 rounded-full"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden sm:table-cell">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-200"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          <div className="h-5 w-12 bg-gray-100 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden md:table-cell">
        <div className="h-3 sm:h-4 bg-gray-100 rounded w-12 sm:w-20"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-100 rounded-full"></div>
      </td>
    </tr>
  );

  // Responsive Grid Layout Component
  const GridView = () => (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {currentAlbums.map((album) => (
        <div
          key={album.album_id}
          className={`bg-white border border-gray-200 rounded-xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg cursor-pointer group ${
            hoveredRow === album.album_id
              ? "bg-[#EDE4FF]/60 border-[#7D5BC6]/30"
              : "hover:border-gray-300"
          }`}
          onClick={() => handleAlbumClick(album.album_id)}
          onMouseEnter={() => setHoveredRow(album.album_id)}
          onMouseLeave={() => setHoveredRow(null)}
        >
          {/* Card header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer accent-[#7D5BC6] flex-shrink-0"
                checked={selectedAlbums.includes(album.album_id)}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCheckboxChange(album.album_id, e.target.checked);
                }}
              />
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-300">
                {getAlbumPreview(album) ? (
                  <img
                    src={getAlbumPreview(album)}
                    alt={album.album_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm sm:text-lg font-bold text-[#7D5BC6]">
                    {album.album_name
                      ? album.album_name.charAt(0).toUpperCase()
                      : "A"}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-[#EDE4FF] transition-all duration-300 touch-manipulation"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDropdown(album.album_id, e);
                }}
              >
                <MoreVertical size={16} className="text-gray-600" />
              </button>

              {/* Dropdown menu */}
              {activeDropdown === album.album_id && (
                <div className="absolute right-0 top-10 z-50 w-40 sm:w-48 py-1 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-2xl">
                  <button
                    className="flex items-center px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#EDE4FF] text-gray-700 text-left cursor-pointer transition-all duration-300 w-full text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadCSV(album.album_id, e);
                    }}
                  >
                    <FileText
                      size={14}
                      className="mr-2 sm:mr-3 text-gray-500"
                    />
                    Export CSV
                  </button>
                  <button
                    className="flex items-center px-3 sm:px-4 py-2 sm:py-3 hover:bg-red-50 text-gray-700 text-left cursor-pointer transition-all duration-300 w-full text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(album.album_id, e);
                    }}
                  >
                    <Trash2 size={14} className="mr-2 sm:mr-3 text-red-500" />
                    <span className="text-red-500">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card content */}
          <div className="space-y-2">
            {displayIds && (
              <div className="text-xs text-gray-500 font-mono">
                #{album.album_id.substring(0, 8)}...
              </div>
            )}
            <div className="font-medium text-black text-sm sm:text-base line-clamp-2">
              {album.album_name || "Untitled Album"}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {album.images && album.images[0]
                ? album.images[0].description?.substring(0, 60) + "..."
                : "No description available"}
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="bg-[#EDE4FF] px-2 py-1 rounded-full border border-gray-200 font-medium">
                {album.image_count || 0} files
              </span>
              <span className="text-gray-600 text-xs">
                {formatDate(album.created_at)}
              </span>
            </div>

            {/* Keywords */}
            <div className="flex flex-wrap gap-1">
              {getAllKeywords(album).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#EDE4FF] rounded-full text-xs border border-gray-200 cursor-pointer hover:bg-[#7D5BC6]/20 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm(keyword);
                  }}
                >
                  {keyword}
                </span>
              ))}
              {getAllKeywords(album).length > (isMobile ? 3 : 5) && (
                <span className="text-xs text-gray-500">
                  +{getAllKeywords(album).length - (isMobile ? 3 : 5)} more
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Responsive Table Layout Component
  const ListView = () => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-700 border-b border-gray-200">
            <th className="w-8 p-2 sm:p-4 rounded-tl-xl">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-[#7D5BC6]"
                  checked={
                    selectedAlbums.length === currentAlbums.length &&
                    currentAlbums.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </div>
            </th>
            <th className="p-2 sm:p-4 text-sm sm:text-base">Album</th>
            <th className="p-2 sm:p-4 text-center text-sm sm:text-base">
              Files
            </th>
            <th className="p-2 sm:p-4 text-center text-sm sm:text-base hidden sm:table-cell">
              Status
            </th>
            <th className="p-2 sm:p-4 text-sm sm:text-base hidden lg:table-cell">
              Keywords
            </th>
            <th className="p-2 sm:p-4 text-sm sm:text-base hidden md:table-cell">
              Created
            </th>
            <th className="p-2 sm:p-4 rounded-tr-xl text-sm sm:text-base">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentAlbums.map((album, index) => (
            <tr
              key={album.album_id}
              className={`text-black transition-all duration-300 group cursor-pointer ${
                hoveredRow === album.album_id
                  ? "bg-[#EDE4FF]/60"
                  : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setHoveredRow(album.album_id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => handleAlbumClick(album.album_id)}
            >
              <td className="p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#7D5BC6]"
                    checked={selectedAlbums.includes(album.album_id)}
                    onChange={(e) =>
                      handleCheckboxChange(album.album_id, e.target.checked)
                    }
                  />
                </div>
              </td>
              <td className="p-2 sm:p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mr-2 sm:mr-4 transition-all duration-300 group-hover:scale-105 border border-gray-200 shadow-sm">
                    {getAlbumPreview(album) ? (
                      <img
                        src={getAlbumPreview(album)}
                        alt={album.album_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm sm:text-lg font-bold text-[#7D5BC6]">
                        {album.album_name
                          ? album.album_name.charAt(0).toUpperCase()
                          : "A"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    {displayIds && (
                      <span className="text-xs text-gray-500 mb-0.5 font-mono">
                        #{album.album_id.substring(0, 8)}...
                      </span>
                    )}
                    <span className="text-xs sm:text-sm text-black font-medium mb-1 truncate">
                      {album.album_name || "Untitled Album"}
                    </span>
                    <span className="text-xs text-gray-500 line-clamp-1 sm:line-clamp-2">
                      {album.images && album.images[0]
                        ? album.images[0].description?.substring(0, 60) + "..."
                        : "No description available"}
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-2 sm:p-4">
                <div className="flex justify-center">
                  <span className="bg-[#EDE4FF] px-2 py-1 rounded-full text-xs sm:text-sm border border-gray-200 transition-colors duration-300 group-hover:bg-[#7D5BC6]/20">
                    {album.image_count || 0}
                  </span>
                </div>
              </td>
              <td className="p-2 sm:p-4 hidden sm:table-cell">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#7D5BC6] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
                    <Check size={12} className="text-white" />
                  </div>
                </div>
              </td>
              <td className="p-2 sm:p-4 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {getAllKeywords(album).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#EDE4FF] rounded-full text-xs border border-gray-200 transition-all duration-300 hover:bg-[#7D5BC6]/20 hover:border-[#7D5BC6] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm(keyword);
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-2 sm:p-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                {formatDate(album.created_at)}
              </td>
              <td
                className="p-2 sm:p-4 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="p-2 rounded-full hover:bg-[#EDE4FF] transition-all duration-300 group-hover:text-black touch-manipulation"
                  onClick={(e) => toggleDropdown(album.album_id, e)}
                >
                  <MoreVertical
                    size={16}
                    className="text-gray-600 group-hover:text-black transition-colors duration-300"
                  />
                </button>

                {activeDropdown === album.album_id && (
                  <div
                    className="absolute right-0 z-50 w-40 sm:w-48 py-1 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-2xl transition-all duration-300 animate-fadeIn"
                    style={{
                      top: "auto",
                      bottom: "auto",
                      [index >= currentAlbums.length - 1 ? "bottom" : "top"]:
                        "3rem",
                    }}
                  >
                    <div className="flex flex-col divide-y divide-gray-100">
                      <button
                        className="flex items-center px-3 sm:px-4 py-2 sm:py-3 hover:bg-[#EDE4FF] text-gray-700 text-left cursor-pointer transition-all duration-300 text-sm"
                        onClick={(e) => handleDownloadCSV(album.album_id, e)}
                        disabled={isDownloadingCSV}
                      >
                        <FileText
                          size={14}
                          className="mr-2 sm:mr-3 text-gray-500"
                        />
                        {isDownloadingCSV ? "Exporting..." : "Export CSV"}
                      </button>
                      <button
                        className="flex items-center px-3 sm:px-4 py-2 sm:py-3 hover:bg-red-50 text-gray-700 text-left cursor-pointer transition-all duration-300 text-sm"
                        onClick={(e) => handleDeleteClick(album.album_id, e)}
                      >
                        <Trash2
                          size={14}
                          className="mr-2 sm:mr-3 text-red-500"
                        />
                        <span className="text-red-500">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-2 sm:p-4 md:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-7xl relative">
          {/* Header skeleton */}
          <div className="animate-pulse text-center mb-6 sm:mb-8">
            <div className="h-8 sm:h-12 lg:h-16 bg-gray-200 rounded-lg w-32 sm:w-48 mx-auto mb-4"></div>
            <div className="h-3 sm:h-4 bg-gray-100 rounded w-64 sm:w-96 mx-auto"></div>
          </div>

          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200">
            <div className="p-3 sm:p-4 lg:p-6">
              {/* Search bar skeleton */}
              <div className="animate-pulse mb-4 sm:mb-6">
                <div className="h-12 sm:h-16 bg-gray-100 rounded-xl"></div>
              </div>

              {/* Controls skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 py-3 border-b border-gray-200 animate-pulse">
                <div className="flex items-center">
                  <div className="h-5 w-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-4 w-24 sm:w-32 bg-gray-100 rounded"></div>
                </div>
                <div className="flex flex-wrap sm:ml-auto gap-2">
                  <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                  <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                  <div className="flex">
                    <div className="h-10 w-10 bg-gray-100 rounded-l-lg"></div>
                    <div className="h-10 w-10 bg-gray-100"></div>
                    <div className="h-10 w-10 bg-gray-100 rounded-r-lg"></div>
                  </div>
                </div>
              </div>

              {/* Content skeleton - responsive */}
              <div className="block sm:hidden">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                  {[...Array(4)].map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              </div>

              <div className="hidden sm:block rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-700 border-b border-gray-200">
                      <th className="w-8 p-4 rounded-tl-xl">
                        <div className="flex items-center justify-center">
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </th>
                      <th className="p-4">Album</th>
                      <th className="p-4 text-center">Files</th>
                      <th className="p-4 text-center hidden sm:table-cell">
                        Status
                      </th>
                      <th className="p-4 hidden lg:table-cell">Keywords</th>
                      <th className="p-4 hidden md:table-cell">Created</th>
                      <th className="p-4 rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...Array(5)].map((_, index) => (
                      <SkeletonRow key={index} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 md:p-6 lg:p-8 flex justify-center">
      {/* Toast notification - responsive */}
      {toastMessage.show && (
        <div
          className={`fixed top-4 right-2 sm:right-4 px-3 sm:px-4 py-2 rounded-lg text-white shadow-lg z-[100] transition-all duration-300 text-xs sm:text-sm max-w-[calc(100vw-1rem)] sm:max-w-md ${
            toastMessage.type === "success" ? "bg-[#7D5BC6]" : "bg-red-600"
          }`}
        >
          {toastMessage.message}
        </div>
      )}

      {/* Download Progress Toast - responsive */}
      {isDownloadingCSV && downloadProgress.total > 1 && (
        <div className="fixed top-16 right-2 sm:right-4 mt-2 px-3 sm:px-4 py-2 rounded-lg text-white shadow-lg z-[100] bg-[#7D5BC6] text-xs sm:text-sm max-w-[calc(100vw-1rem)] sm:max-w-md">
          {downloadProgress.current === 0
            ? `Preparing to download ${downloadProgress.total} files...`
            : downloadProgress.current === downloadProgress.total
            ? `Completed ${downloadProgress.current} of ${downloadProgress.total} files!`
            : `Downloading ${downloadProgress.current} of ${downloadProgress.total} files...`}
        </div>
      )}

      <div className="w-full max-w-7xl relative">
        {/* Responsive Header */}
        <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-center mb-2 sm:mb-4 lg:mb-8 text-[#7D5BC6]">
          Albums
        </h1>
        <p className="text-center text-gray-600 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto text-sm sm:text-base px-2 sm:px-4">
          Check out your albums and manage them easily. You can search, filter,
          and delete albums as needed.
        </p>

        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 transition-all duration-500 opacity-100 scale-100">
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Search bar */}
            <SearchBar onSearch={handleSearch} initialValue={searchTerm} />

            {/* Controls - responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <div className="relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-300">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={displayIds}
                    onChange={() => setDisplayIds(!displayIds)}
                  />
                  <span
                    className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                      displayIds ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {displayIds && (
                      <span className="absolute inset-0 flex h-full w-full items-center justify-center text-[#7D5BC6]">
                        <Check size={10} />
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-black ml-3 mr-2 text-sm sm:text-base">
                  Display album IDs
                </span>
              </div>

              {selectedAlbums.length > 0 && (
                <div className="px-2.5 py-1 bg-[#EDE4FF] rounded-full text-xs font-medium text-[#7D5BC6] border border-gray-200">
                  {selectedAlbums.length} selected
                </div>
              )}

              <div className="flex flex-wrap sm:ml-auto gap-2 items-center">
                {/* View mode toggle - only show on larger screens */}
                {!isMobile && (
                  <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                    <button
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        getCurrentViewMode() === "grid"
                          ? "bg-white shadow-sm text-[#7D5BC6]"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setViewMode("grid")}
                      title="Grid view"
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        getCurrentViewMode() === "list"
                          ? "bg-white shadow-sm text-[#7D5BC6]"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      onClick={() => setViewMode("list")}
                      title="List view"
                    >
                      <List size={16} />
                    </button>
                  </div>
                )}

                <button
                  className="p-2 sm:p-2 rounded-full hover:bg-[#EDE4FF] transition-all duration-300 group min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  title="Export selected albums as CSV"
                  onClick={handleDownloadSelectedCSV}
                  disabled={selectedAlbums.length === 0 || isDownloadingCSV}
                >
                  <Download
                    className={`${
                      selectedAlbums.length > 0 && !isDownloadingCSV
                        ? "text-gray-600 group-hover:text-black"
                        : "text-gray-400"
                    } transition-all duration-300`}
                    size={18}
                  />
                </button>
                <button
                  className="p-2 sm:p-2 rounded-full hover:bg-red-50 transition-all duration-300 group min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  title="Delete selected albums"
                  onClick={handleDeleteSelected}
                  disabled={selectedAlbums.length === 0}
                >
                  <Trash2
                    className={`${
                      selectedAlbums.length > 0
                        ? "text-gray-600 group-hover:text-red-600"
                        : "text-gray-400"
                    } transition-all duration-300`}
                    size={18}
                  />
                </button>

                {/* Pagination controls */}
                <div className="flex">
                  <button
                    className="p-2 sm:p-2 rounded-l-lg bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 border-r-0 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                    onClick={goToPrevPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft
                      className={`${
                        page > 1
                          ? "text-gray-600 group-hover:text-black"
                          : "text-gray-400"
                      } transition-all duration-300`}
                      size={18}
                    />
                  </button>
                  <button
                    className="p-2 sm:p-2 bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 border-r-0 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                    onClick={goToNextPage}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight
                      className={`${
                        page < totalPages
                          ? "text-gray-600 group-hover:text-black"
                          : "text-gray-400"
                      } transition-all duration-300`}
                      size={18}
                    />
                  </button>
                  <button
                    className="p-2 sm:p-2 rounded-r-lg bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                    onClick={() => setPage(totalPages)}
                    disabled={page >= totalPages}
                  >
                    <ChevronsRight
                      className={`${
                        page < totalPages
                          ? "text-gray-600 group-hover:text-black"
                          : "text-gray-400"
                      } transition-all duration-300`}
                      size={18}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-4 sm:mb-6 shadow-sm">
                <p className="text-sm sm:text-base">Error: {error}</p>
                <button
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-800 text-sm shadow-sm touch-manipulation"
                  onClick={() => dispatch(fetchAlbumsWithDetails())}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!error && filteredAlbums.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                <div className="bg-[#EDE4FF] rounded-full p-4 sm:p-5 mb-4">
                  {noResultsFound ? (
                    <Search
                      className="text-[#7D5BC6]"
                      size={isMobile ? 24 : 32}
                    />
                  ) : (
                    <Trash2
                      className="text-[#7D5BC6]"
                      size={isMobile ? 24 : 32}
                    />
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
                  {noResultsFound ? "No Results Found" : "No Albums Found"}
                </h3>
                <p className="text-gray-600 max-w-md text-sm sm:text-base">
                  {noResultsFound
                    ? `No albums match your search for "${searchTerm}"`
                    : "You haven't created any albums yet. Upload some images to get started."}
                </p>
                {noResultsFound && (
                  <button
                    className="mt-4 px-4 py-2 bg-[#7D5BC6] hover:bg-[#6b4ba8] rounded-lg text-white shadow-lg transition-colors touch-manipulation"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* Album content - responsive views */}
            {!error && currentAlbums.length > 0 && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                {getCurrentViewMode() === "grid" ? <GridView /> : <ListView />}
              </div>
            )}

            {/* Professional Responsive Pagination */}
            {!error && filteredAlbums.length > 0 && (
              <div className="p-3 sm:p-4">
                {/* Mobile Pagination - Single Row */}
                <div className="flex sm:hidden items-center justify-between">
                  <button
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation ${
                      page > 1
                        ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-gray-700"
                        : "bg-gray-100 cursor-not-allowed border border-gray-200 text-gray-400"
                    }`}
                    onClick={goToPrevPage}
                    disabled={page <= 1}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">Page</span>
                    <span className="px-2 py-1 bg-[#7D5BC6] text-white rounded-lg text-sm font-medium">
                      {page}
                    </span>
                    <span className="text-sm text-gray-600">
                      of {totalPages}
                    </span>
                  </div>

                  <button
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 touch-manipulation ${
                      page < totalPages
                        ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm text-gray-700"
                        : "bg-gray-100 cursor-not-allowed border border-gray-200 text-gray-400"
                    }`}
                    onClick={goToNextPage}
                    disabled={page >= totalPages}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Desktop Pagination - Full Featured */}
                <div className="hidden sm:flex justify-between items-center text-gray-600">
                  <button
                    className={`p-3 rounded-lg min-h-[44px] min-w-[44px] touch-manipulation ${
                      page > 1
                        ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                        : "bg-gray-100 cursor-not-allowed border border-gray-200"
                    } transition-all duration-300 disabled:opacity-50`}
                    onClick={goToPrevPage}
                    disabled={page <= 1}
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>

                  {/* Page indicators - desktop only */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;

                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (page <= 3) {
                        if (i < 4) {
                          pageNumber = i + 1;
                        } else {
                          pageNumber = totalPages;
                        }
                      } else if (page >= totalPages - 2) {
                        if (i === 0) {
                          pageNumber = 1;
                        } else {
                          pageNumber = totalPages - 4 + i;
                        }
                      } else {
                        if (i === 0) {
                          pageNumber = 1;
                        } else if (i === 4) {
                          pageNumber = totalPages;
                        } else {
                          pageNumber = page - 1 + i;
                        }
                      }

                      // Ellipsis handling
                      if (
                        (i === 1 && pageNumber !== 2 && page > 3) ||
                        (i === 3 &&
                          pageNumber !== totalPages - 1 &&
                          page < totalPages - 2)
                      ) {
                        return (
                          <span key={i} className="text-gray-500 text-sm">
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNumber)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm touch-manipulation ${
                            page === pageNumber
                              ? "bg-[#7D5BC6] text-white font-medium shadow-lg"
                              : "hover:bg-[#EDE4FF] text-gray-600 hover:text-black transition-all duration-300"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className={`p-3 rounded-lg min-h-[44px] min-w-[44px] touch-manipulation ${
                      page < totalPages
                        ? "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                        : "bg-gray-100 cursor-not-allowed border border-gray-200"
                    } transition-all duration-300 disabled:opacity-50`}
                    onClick={goToNextPage}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Search statistics */}
            {searchTerm && !error && (
              <div className="flex justify-center mt-4">
                <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 px-4">
                  <Info size={14} className="text-[#7D5BC6] flex-shrink-0" />
                  <span className="text-center">
                    {noResultsFound
                      ? `No albums match "${searchTerm}"`
                      : `Showing ${filteredAlbums.length} ${
                          filteredAlbums.length === 1 ? "album" : "albums"
                        } matching "${searchTerm}"`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Platform Selection Modal - responsive */}
      <PlatformSelectionModal
        isOpen={showPlatformModal}
        onClose={handleModalClose}
        onConfirm={handlePlatformConfirm}
        isLoading={isDownloadingCSV}
        albumId={modalConfig.albumId}
        albumName={modalConfig.albumName}
        isMultiple={modalConfig.isMultiple}
        selectedCount={modalConfig.selectedAlbumIds.length}
      />

      {/* Delete confirmation modal - responsive */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn backdrop-blur-sm bg-black/50 p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={cancelDelete}
          ></div>
          <div className="relative max-w-sm sm:max-w-md w-full transform transition-all duration-300 animate-scaleIn">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200">
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2">
                  Confirm Delete
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Are you sure you want to delete this album? This action cannot
                  be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all duration-300 shadow-sm text-center min-h-[44px] touch-manipulation"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-3 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 flex items-center justify-center shadow-lg min-h-[44px] touch-manipulation"
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

      {/* Responsive animations and styles */}
      <style jsx>{`
        @media (max-width: 475px) {
          .xs:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .touch-manipulation {
          touch-action: manipulation;
        }

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

        /* Responsive utilities */
        @media (max-width: 640px) {
          .min-w-[600px] {
            min-width: 100%;
          }
        }

        /* Custom scrollbar for mobile */
        @media (max-width: 768px) {
          .overflow-x-auto::-webkit-scrollbar {
            height: 4px;
          }

          .overflow-x-auto::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #7d5bc6;
            border-radius: 4px;
          }
        }
      `}</style>
    </div>
  );
}

export default AlbumsPage;
