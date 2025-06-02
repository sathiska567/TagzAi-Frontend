/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  X,
  Upload,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Diamond,
} from "lucide-react";
import { logout } from "../../../store/slices/authSlice";
import {
  clearUserProfile,
  fetchUserProfile,
} from "../../../store/slices/userSlice";
import { resetAlbumData } from "../../../store/slices/albumSlice";
import { useAuth } from "../../Auth/AuthContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [lastCreditsCheck, setLastCreditsCheck] = useState(0);

  const profileDropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openAuth } = useAuth();

  // Get auth and user state from Redux
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { profile, lastFetched } = useSelector((state) => state.user);

  // Refresh user profile when logged in or when lastFetched changes
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch user profile immediately when logged in
      dispatch(fetchUserProfile());
    }
  }, [isLoggedIn, dispatch]);

  // Set up a polling mechanism to periodically refresh the profile
  useEffect(() => {
    let intervalId;

    if (isLoggedIn) {
      // Check for profile updates every 15 seconds
      intervalId = setInterval(() => {
        const now = Date.now();
        // Only fetch if it's been more than 10 seconds since the last fetch
        if (now - lastCreditsCheck > 10000) {
          dispatch(fetchUserProfile());
          setLastCreditsCheck(now);
        }
      }, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn, dispatch, lastCreditsCheck]);

  // Refresh profile whenever the lastFetched timestamp changes
  useEffect(() => {
    if (lastFetched) {
      setLastCreditsCheck(Date.now());
    }
  }, [lastFetched]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicks outside of profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle login button click
  const handleLoginClick = () => {
    openAuth("login");

    // Create a polling mechanism to check for login and fetch profile
    const checkLoginStatus = setInterval(() => {
      if (isLoggedIn) {
        dispatch(fetchUserProfile());
        clearInterval(checkLoginStatus);
      }
    }, 500); // Check every 500ms

    // Clear interval after 10 seconds to prevent endless polling
    setTimeout(() => clearInterval(checkLoginStatus), 10000);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserProfile());
    dispatch(resetAlbumData());
    setProfileDropdownOpen(false);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Handle image upload and tag generation
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const imageFile = e.target.files[0];
      const imageUrl = URL.createObjectURL(imageFile);
      setUploadedImage(imageUrl);

      // Simulate tag generation with a loading state
      setTags([]);
      setTimeout(() => {
        const generatedTags = [
          "AI",
          "Machine Learning",
          "Computer Vision",
          "Neural Network",
          "Deep Learning",
        ];
        setTags(generatedTags);

        // Refresh the user profile to get updated credits after tag generation
        dispatch(fetchUserProfile());
      }, 1500);
    }
  };

  // Get first letter for avatar
  const getAvatarContent = () => {
    if (!isLoggedIn) {
      return <User size={16} className="text-white" />;
    }

    if (profile && profile.f_name) {
      return profile.f_name.charAt(0).toUpperCase();
    }

    if (profile && profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }

    return <User size={16} className="text-white" />;
  };

  // Get display name for profile
  const getDisplayName = () => {
    if (!isLoggedIn) return "Profile";

    if (profile && profile.f_name) {
      return profile.f_name;
    }

    return "Profile";
  };

  // Get credits count
  const getCreditsCount = () => {
    if (profile && profile.credits !== undefined) {
      return profile.credits;
    }
    return 0;
  };

  // Force refresh profile data
  const forceRefreshProfile = () => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
    }
  };

  // Navigation links
  const navLinks = [
    {
      name: "Upload",
      path: "/upload",
      icon: <Upload size={16} />,
      isUpload: true,
    },
    { name: "Pricing", path: "/pricing", icon: null },
    { name: "FAQ", path: "/faq", icon: null },
    // { name: "API", path: "/api", icon: null, hasDropdown: true },
    { name: "Albums", path: "/albums", icon: null },
  ];

  return (
    <div className="sticky top-0 z-50">
      <nav
        className={`${
          scrolled
            ? "bg-white text-gray-900 shadow-lg"
            : "bg-white/95 text-gray-900 shadow-sm backdrop-blur-md"
        } transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand - left side */}
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <a href="/">
                  <h1 className="text-xl font-bold text-[#7d5bc6] tracking-tight">
                    TagzAi
                    <span style={{ color: "#7d5bc6" }}>.</span>
                  </h1>
                </a>
              </div>
            </div>

            {/* Navigation for desktop - right side */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  {link.isUpload ? (
                    <Link
                      to={link.path}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium cursor-pointer group relative overflow-hidden transition-all hover:scale-105"
                    >
                      <span className="absolute inset-0 bg-[#f2ebff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                      <Upload size={16} className="mr-2 relative z-10" />
                      <span className="relative z-10">Upload</span>
                    </Link>
                  ) : (
                    <Link
                      to={link.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium relative overflow-hidden group transition-all hover:scale-105`}
                    >
                      <span className="absolute inset-0 bg-[#f2ebff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                      {link.icon && (
                        <span className="mr-2 relative z-10">{link.icon}</span>
                      )}
                      <span className="relative z-10">{link.name}</span>
                      {link.hasDropdown && (
                        <ChevronDown
                          size={14}
                          className="ml-1 relative z-10 group-hover:rotate-180 transition-transform duration-300"
                        />
                      )}
                    </Link>
                  )}

                  {/* Dropdown for API if needed */}
                  {link.hasDropdown && (
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 origin-top-left border border-gray-100">
                      <a
                        href="/api/docs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: "#374151" }}
                      >
                        Documentation
                      </a>
                      <a
                        href="/api/keys"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: "#374151" }}
                      >
                        API Keys
                      </a>
                      <a
                        href="/api/playground"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        style={{ color: "#374151" }}
                      >
                        Playground
                      </a>
                    </div>
                  )}
                </div>
              ))}

              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {isLoggedIn && (
                <>
                  {/* Credits Display */}
                  <div
                    className="px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-1.5 ml-2 cursor-pointer hover:bg-gray-100"
                    onClick={forceRefreshProfile}
                    title="Click to refresh credits"
                  >
                    <Diamond size={16} className="fill-current opacity-90" />
                    <span className="text-xs font-medium">
                      {getCreditsCount()}
                    </span>
                  </div>
                </>
              )}

              {/* Profile/Login Section */}
              {isLoggedIn ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ml-2 relative group overflow-hidden hover:scale-105`}
                  >
                    <span className="absolute inset-0 bg-[#f2ebff] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                    {/* User avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-sm relative z-10"
                      style={{ backgroundColor: "#7d5bc6" }}
                    >
                      {getAvatarContent()}
                    </div>
                    <span className="relative z-10">{getDisplayName()}</span>
                    <ChevronDown
                      size={14}
                      className={`ml-1 relative z-10 transition-transform duration-300 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100">
                      <Link
                        to="/user-profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors duration-200"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <User size={14} className="inline mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <LogOut size={14} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-md transition-all duration-300 flex items-center gap-2 ml-2 relative overflow-hidden group transform hover:scale-105 hover:opacity-90"
                  style={{ backgroundColor: "#7d5bc6" }}
                >
                  <span className="absolute inset-0 bg-white/20 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                  <LogIn size={16} className="relative z-10" />
                  <span className="relative z-10">Login</span>
                </button>
              )}
            </div>

            {/* Mobile menu button - right aligned */}
            <div className="lg:hidden flex items-center ml-auto">
              {isLoggedIn && (
                <>
                  {/* Mobile Credits Display */}
                  <div
                    className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 transition-colors duration-200 flex items-center gap-1 mr-2 cursor-pointer hover:bg-gray-100"
                    onClick={forceRefreshProfile}
                    title="Click to refresh credits"
                  >
                    <Diamond size={14} className="fill-current opacity-90" />
                    <span className="text-xs font-medium">
                      {getCreditsCount()}
                    </span>
                  </div>
                </>
              )}

              {!isLoggedIn && (
                <button
                  onClick={handleLoginClick}
                  className="p-2 rounded-lg mr-2 transition-colors duration-200 text-white"
                  style={{ backgroundColor: "#7d5bc6" }}
                >
                  <LogIn size={20} />
                </button>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <input
                id="mobile-image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="lg:hidden bg-white text-gray-900 absolute w-full z-50 shadow-lg transition-all duration-300 border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.isUpload ? (
                    <Link
                      to={link.path}
                      className="block px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 flex items-center gap-2 relative overflow-hidden group transition-all"
                    >
                      <span className="absolute inset-0 bg-gray-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                      <Upload size={16} className="relative z-10" />
                      <span className="relative z-10">Upload</span>
                    </Link>
                  ) : (
                    <Link
                      to={link.path}
                      className="block px-3 py-2 rounded-lg text-base font-medium flex items-center relative overflow-hidden group transition-all hover:bg-gray-50"
                    >
                      <span className="absolute inset-0 bg-gray-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                      {link.icon && (
                        <span className="mr-2 relative z-10">{link.icon}</span>
                      )}
                      <span className="relative z-10">{link.name}</span>
                      {link.hasDropdown && (
                        <ChevronDown
                          size={14}
                          className="ml-2 relative z-10 group-hover:rotate-180 transition-transform duration-300"
                        />
                      )}
                    </Link>
                  )}

                  {/* Dropdown items for mobile */}
                  {link.hasDropdown && (
                    <div className="pl-6 mt-1 border-l-2 border-gray-200 ml-4">
                      <a
                        href="/api/docs"
                        className="block px-3 py-2 text-sm opacity-80 hover:opacity-100"
                      >
                        Documentation
                      </a>
                      <a
                        href="/api/keys"
                        className="block px-3 py-2 text-sm opacity-80 hover:opacity-100"
                      >
                        API Keys
                      </a>
                      <a
                        href="/api/playground"
                        className="block px-3 py-2 text-sm opacity-80 hover:opacity-100"
                      >
                        Playground
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-100">
                  <div className="flex items-center px-3 py-2">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={forceRefreshProfile}
                    >
                      <Diamond
                        size={16}
                        className="fill-current opacity-90"
                        style={{ color: "#7d5bc6" }}
                      />
                      <span className="text-sm font-medium">
                        {getCreditsCount()} Credits
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/user-profile"
                    className="block px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2 relative overflow-hidden group hover:bg-gray-50"
                  >
                    <span className="absolute inset-0 bg-gray-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-sm relative z-10"
                      style={{ backgroundColor: "#7d5bc6" }}
                    >
                      {getAvatarContent()}
                    </div>
                    <span className="relative z-10">{getDisplayName()}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 text-left px-3 py-2 rounded-lg text-base font-medium flex items-center gap-2 relative overflow-hidden group hover:bg-gray-50"
                  >
                    <span className="absolute inset-0 bg-gray-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                    <LogOut size={16} className="relative z-10" />
                    <span className="relative z-10">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Tag display area if image is uploaded */}
      {uploadedImage && (
        <div
          className="bg-white py-3 px-4 transition-all duration-300 border-t border-gray-100"
          style={{ backgroundColor: "#f8f7ff" }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center">
              <div
                className="h-10 w-10 rounded-lg overflow-hidden border-2 shadow-md mr-3"
                style={{ borderColor: "#7d5bc6" }}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {tags.length > 0 ? "Generated Tags:" : "Analyzing image..."}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm text-gray-700"
                    style={{ backgroundColor: "#F2EBFF" }}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <div className="flex space-x-2 items-center">
                  <div className="animate-pulse flex space-x-2">
                    <div
                      className="h-5 w-16 rounded-full"
                      style={{ backgroundColor: "#F2EBFF" }}
                    ></div>
                    <div
                      className="h-5 w-24 rounded-full"
                      style={{ backgroundColor: "#F2EBFF" }}
                    ></div>
                    <div
                      className="h-5 w-20 rounded-full"
                      style={{ backgroundColor: "#F2EBFF" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// This custom hook can be used in other components to trigger profile refresh
// eslint-disable-next-line react-refresh/only-export-components
export const useProfileRefresh = () => {
  const dispatch = useDispatch();

  return {
    refreshProfile: () => dispatch(fetchUserProfile()),
  };
};

export default NavBar;
