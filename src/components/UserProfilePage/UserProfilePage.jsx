// pages/UserProfilePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit2,
  Camera,
  Mail,
  Briefcase,
  Save,
  X,
  Tag,
  Image,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  CreditCard,
} from "lucide-react";
import userService from "../../services/userService";
import authService from "../../services/authService";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlbumsWithDetails } from "../../store/slices/albumSlice";
import { addNotification } from "../../store/slices/uiSlice";

// Skeleton Loading Components
const SkeletonCard = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-100 rounded-lg h-full"></div>
  </div>
);

const SkeletonText = ({ width = "w-full", height = "h-4" }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${width} ${height}`}></div>
);

const SkeletonAvatar = () => (
  <div className="relative mx-auto sm:mx-0">
    <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full bg-gray-100 animate-pulse"></div>
  </div>
);

const SkeletonImageCard = () => (
  <div className="relative">
    <div className="relative rounded-lg border border-gray-100 overflow-hidden bg-white shadow-md">
      <div className="h-28 xs:h-32 sm:h-36 bg-gray-100 animate-pulse"></div>
      <div className="p-3">
        <SkeletonText width="w-3/4" height="h-3" />
        <div className="flex gap-1 mt-2">
          <SkeletonText width="w-12" height="h-4" />
          <SkeletonText width="w-16" height="h-4" />
        </div>
      </div>
    </div>
  </div>
);

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
  actionType,
}) => {
  if (!isOpen) return null;

  let buttonText = "Confirm";
  let loadingText = "Processing...";

  if (actionType === "save") {
    buttonText = "Save";
    loadingText = "Saving...";
  } else if (actionType === "delete") {
    buttonText = "Delete";
    loadingText = "Deleting...";
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-200 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{ backgroundColor: "#7d5bc6" }}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors flex items-center ${
              isLoading ? "opacity-90 cursor-wait" : "hover:opacity-90"
            }`}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            )}
            {isLoading ? loadingText : buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { albumsWithDetails } = useSelector((state) => state.albums);

  const [userData, setUserData] = useState({
    f_name: "",
    l_name: "",
    email: "",
    package_name: "",
    credits: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...userData });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const profile = await userService.getProfile();
        setUserData(profile);
        setEditData(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        dispatch(
          addNotification({
            type: "error",
            message: "Failed to load user profile",
          })
        );
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchUserProfile();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAlbumsWithDetails());
  }, [dispatch]);

  const allImages = albumsWithDetails
    .flatMap((album) => album.images || [])
    .slice(0, 5);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleSaveClick = () => {
    setShowEditConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);

      await userService.updateProfile({
        f_name: editData.f_name,
        l_name: editData.l_name,
      });

      setUserData({
        ...userData,
        f_name: editData.f_name,
        l_name: editData.l_name,
      });
      setIsEditing(false);

      dispatch(
        addNotification({
          type: "success",
          message: "Profile updated successfully",
        })
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to update profile",
        })
      );
    } finally {
      setIsSaving(false);
      setShowEditConfirmModal(false);
    }
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      setIsDeleting(true);

      await authService.deleteAccount();
      authService.logout();
      navigate("/login");

      dispatch(
        addNotification({
          type: "success",
          message: "Account deleted successfully",
        })
      );
    } catch (error) {
      console.error("Error deleting account:", error);
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to delete account",
        })
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <ConfirmationModal
        isOpen={showEditConfirmModal}
        title="Save Profile Changes"
        message="Are you sure you want to save these changes to your profile?"
        onConfirm={handleConfirmSave}
        onCancel={() => !isSaving && setShowEditConfirmModal(false)}
        isLoading={isSaving}
        actionType="save"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmModal}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => !isDeleting && setShowDeleteConfirmModal(false)}
        isLoading={isDeleting}
        actionType="delete"
      />

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-center mb-12">
            <SkeletonText width="w-96 mx-auto" height="h-12" />
            <div className="mt-4">
              <SkeletonText width="w-64 mx-auto" height="h-4" />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-2 text-[#7D5BC6]">
              User Profile
            </h1>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Manage your profile information and AI-tagged images
            </p>
          </>
        )}

        <div
          className={`transition-all duration-500 ${
            isLoading ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="bg-white rounded-lg border border-gray-100 shadow-lg">
            {/* Profile Header */}
            <div
              className="w-full h-32 md:h-48"
              style={{ backgroundColor: "#f8f7ff" }}
            ></div>

            <div className="px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-end -mt-20 md:-mt-24">
                  {isLoading ? (
                    <SkeletonAvatar />
                  ) : (
                    <div className="relative mx-auto sm:mx-0">
                      <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-sm">
                        <User size={40} className="text-gray-400 md:hidden" />
                        <User
                          size={64}
                          className="text-gray-400 hidden md:block"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 sm:mt-0 sm:ml-6 sm:pb-2 text-center sm:text-left">
                    {isLoading ? (
                      <>
                        <SkeletonText width="w-48" height="h-6" />
                        <div className="mt-2">
                          <SkeletonText width="w-32" height="h-4" />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {userData.f_name} {userData.l_name}
                        </h2>
                        <div className="flex items-center justify-center sm:justify-start mt-3 space-x-3">
                          <span
                            className="text-white text-sm px-3 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#7d5bc6" }}
                            onClick={() => navigate("/pricing")}
                          >
                            {userData.package_name}
                          </span>
                          <span className="flex items-center text-sm text-gray-600">
                            <CreditCard size={16} className="mr-1" />
                            {userData.credits} credits
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 sm:mt-0 text-center sm:text-right">
                  {isLoading ? (
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                      <SkeletonText width="w-16" height="h-10" />
                      <SkeletonText width="w-24" height="h-10" />
                    </div>
                  ) : isEditing ? (
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                      <button
                        onClick={handleSaveClick}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#7d5bc6" }}
                      >
                        <Save size={16} className="mr-2 inline" /> Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <X size={16} className="mr-2 inline" /> Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#7d5bc6" }}
                      >
                        <Edit2 size={16} className="mr-2 inline" /> Edit
                      </button>
                      <button
                        onClick={handleDeleteAccountClick}
                        className="px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} className="mr-2 inline" /> Delete
                        Account
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {/* User info */}
                <div className="md:col-span-1">
                  <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-md">
                    {isLoading ? (
                      <>
                        <SkeletonText width="w-32" height="h-5" />
                        <div className="mt-6 space-y-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start space-x-3">
                              <SkeletonText width="w-5" height="h-5" />
                              <SkeletonText width="w-full" height="h-4" />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-6 pb-3 border-b border-gray-100 flex justify-between items-center">
                          Personal Information
                          <User size={18} style={{ color: "#7d5bc6" }} />
                        </h3>
                        <ul className="space-y-4">
                          <li className="flex items-start">
                            <Mail
                              className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                              style={{ color: "#7d5bc6" }}
                            />
                            <span className="text-gray-700">
                              {userData.email}
                            </span>
                          </li>
                          <li className="flex items-start">
                            <User
                              className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                              style={{ color: "#7d5bc6" }}
                            />
                            {isEditing ? (
                              <input
                                type="text"
                                name="f_name"
                                value={editData.f_name}
                                onChange={handleChange}
                                className="flex-1 text-gray-700 bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 transition-colors pb-1"
                                style={{
                                  borderBottomColor: isEditing
                                    ? "#7d5bc6"
                                    : undefined,
                                }}
                                placeholder="First Name"
                              />
                            ) : (
                              <span className="text-gray-700">
                                {userData.f_name}
                              </span>
                            )}
                          </li>
                          <li className="flex items-start">
                            <User
                              className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                              style={{ color: "#7d5bc6" }}
                            />
                            {isEditing ? (
                              <input
                                type="text"
                                name="l_name"
                                value={editData.l_name}
                                onChange={handleChange}
                                className="flex-1 text-gray-700 bg-transparent border-b border-gray-200 focus:outline-none focus:border-gray-400 transition-colors pb-1"
                                style={{
                                  borderBottomColor: isEditing
                                    ? "#7d5bc6"
                                    : undefined,
                                }}
                                placeholder="Last Name"
                              />
                            ) : (
                              <span className="text-gray-700">
                                {userData.l_name}
                              </span>
                            )}
                          </li>
                          <li className="flex items-start">
                            <Briefcase
                              className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                              style={{ color: "#7d5bc6" }}
                            />
                            <span className="text-gray-700">
                              <span
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ color: "#7d5bc6" }}
                                onClick={() => navigate("/pricing")}
                              >
                                {userData.package_name}
                              </span>{" "}
                              Plan
                            </span>
                          </li>
                          <li className="flex items-start">
                            <CreditCard
                              className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0"
                              style={{ color: "#7d5bc6" }}
                            />
                            <span className="text-gray-700">
                              {userData.credits} credits available
                            </span>
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {/* Image Gallery */}
                <div className="md:col-span-2">
                  <div className="bg-white border border-gray-100 rounded-lg p-6 shadow-md">
                    {isLoading ? (
                      <>
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                          <SkeletonText width="w-32" height="h-5" />
                          <SkeletonText width="w-16" height="h-8" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonImageCard key={i} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            Your Tagged Images
                            <Tag
                              className="h-5 w-5 ml-2"
                              style={{ color: "#7d5bc6" }}
                            />
                          </h3>

                          <button
                            onClick={() => navigate("/upload")}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#7d5bc6" }}
                          >
                            <Plus size={14} className="mr-1 inline" /> Add New
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {allImages.length > 0 ? (
                            allImages.map((image, index) => (
                              <div
                                key={image.image_id || index}
                                className="group transition-transform hover:scale-[1.02]"
                              >
                                <div className="bg-white border border-gray-100 hover:border-gray-200 transition-colors rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                  <div className="h-36 overflow-hidden">
                                    <img
                                      src={image.image_link}
                                      alt={image.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-gray-900 text-sm font-medium mb-2 truncate">
                                      {image.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                      {(image.keywords || [])
                                        .slice(0, 2)
                                        .map((tag, idx) => (
                                          <span
                                            key={idx}
                                            className="text-gray-700 text-xs px-2 py-1 rounded-full"
                                            style={{
                                              backgroundColor: "#F2EBFF",
                                            }}
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      {(image.keywords || []).length > 2 && (
                                        <span className="text-xs text-gray-500">
                                          +{(image.keywords || []).length - 2}{" "}
                                          more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full text-center py-12">
                              <div className="bg-gray-50 border border-gray-100 rounded-lg p-8 inline-block shadow-md">
                                <Image
                                  size={32}
                                  className="text-gray-400 mx-auto mb-3"
                                />
                                <p className="text-gray-600 mb-4">
                                  No images found
                                </p>
                                <button
                                  onClick={() => navigate("/upload")}
                                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: "#7d5bc6" }}
                                >
                                  <Plus size={14} className="mr-1 inline" />{" "}
                                  Upload First Image
                                </button>
                              </div>
                            </div>
                          )}

                          {allImages.length > 0 && (
                            <div
                              onClick={() => navigate("/albums")}
                              className="group transition-transform hover:scale-[1.02] cursor-pointer h-full"
                            >
                              <div className="bg-white border border-gray-100 hover:border-gray-200 transition-colors rounded-lg h-full flex flex-col justify-center p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                                  <Eye size={20} style={{ color: "#7d5bc6" }} />
                                </div>
                                <h4 className="text-gray-900 font-medium mb-1">
                                  View All
                                </h4>
                                <p className="text-gray-500 text-sm">
                                  Browse all your albums and images
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
