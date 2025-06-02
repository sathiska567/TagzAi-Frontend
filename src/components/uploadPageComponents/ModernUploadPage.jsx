/* eslint-disable no-unused-vars */
// src/components/uploadPageComponents/ModernUploadPage.js
// PROFESSIONAL THEME - Universal Responsive Design

import React, { useCallback, useState, useEffect } from "react";
import {
  Upload,
  X,
  ArrowRight,
  Sparkles,
  Info,
  Menu,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "./CustomDropdown";
import CustomInput from "./CustomInput";
import FileLimitation from "./FileLimitation";
import InsufficientCreditsModal from "./InsufficientCreditsModal";
import AdvancedProgressLoadingScreen from "./UltraModernProgressScreen";
import imageService from "../../services/imageService";

const ModernUploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [albumName, setAlbumName] = useState("Untitled Album");
  const [prompt, setPrompt] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);

  // Progress tracking state
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showProgressScreen, setShowProgressScreen] = useState(false);

  // State for insufficient credits modal
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState({
    remainingCredits: 0,
    requestedImages: 0,
  });

  // Settings state
  const [settings, setSettings] = useState({
    metadata: false,
    fileNames: false,
    prohibitedChars: false,
    outputLanguage: false,
    creativeResults: false,
    aiGenerated: false,
    titleCase: false,
    useDescriptionAsTitle: false,
    minDescriptionLength: false,
    maxDescriptionLength: false,
    maxTitleLength: false,
    minTitleLength: false,
    maxKeywordCount: false,
    minKeywordCount: false,
    requiredStartKeywords: false,
    requiredEndKeywords: false,
    excludedKeywords: false,
    singleWordKeywordsOnly: false,
  });

  // Settings descriptions for better prompt formation
  const settingsDescriptions = {
    metadata: "Use image metadata for better context",
    fileNames: "Use file names for additional context",
    prohibitedChars: "Avoid using prohibited characters",
    outputLanguage: "Generate output in English",
    creativeResults: "Make results more creative and descriptive",
    aiGenerated: "Mark results as AI generated",
    titleCase: "Format titles in Title Case",
    useDescriptionAsTitle: "Generate titles based on descriptions",
    minDescriptionLength: "Ensure descriptions are at least 100 characters",
    maxDescriptionLength: "Keep descriptions under 500 characters",
    maxTitleLength: "Keep titles under 100 characters",
    minTitleLength: "Ensure titles are at least 20 characters",
    maxKeywordCount: "Generate no more than 30 keywords",
    minKeywordCount: "Generate at least 10 keywords",
    requiredStartKeywords: "Include category keywords at the beginning",
    requiredEndKeywords: "Include technical keywords at the end",
    excludedKeywords: "Exclude common generic terms",
    singleWordKeywordsOnly: "Only use single word keywords",
  };

  // Progress callback for streaming upload
  const handleUploadProgress = (progressData) => {
    setUploadProgress(progressData);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
    if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
  };

  const clearAllFiles = () => {
    files.forEach((file) => {
      if (file.preview) URL.revokeObjectURL(file.preview);
    });
    setFiles([]);
  };

  const updateAlbumName = (name) => {
    setAlbumName(name);
  };

  const updatePrompt = (text) => {
    setPrompt(text);
  };

  const updateSettings = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const buildCompletePrompt = () => {
    let completePrompt = prompt ? prompt.trim() : "";
    const enabledSettings = Object.entries(settings)
      .filter(([_, value]) => value)
      .map(([key, _]) => settingsDescriptions[key]);

    if (enabledSettings.length > 0) {
      if (completePrompt) {
        completePrompt += "\n\n";
      }
      completePrompt += "Settings:\n- " + enabledSettings.join("\n- ");
    }

    return completePrompt.trim();
  };

  const togglePromptPreview = () => {
    setShowPromptPreview(!showPromptPreview);
  };

  const toggleMobileSettings = () => {
    setMobileSettingsOpen(!mobileSettingsOpen);
  };

  const handleGenerate = async () => {
    if (files.length === 0) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    setShowProgressScreen(true);
    setIsUploading(true);
    setUploadError("");

    setUploadProgress({
      total: files.length,
      processed: 0,
      remaining: files.length,
      percentage: 0,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });
      formData.append("album_name", albumName);
      const completePrompt = buildCompletePrompt();
      formData.append("prompt", completePrompt);

      console.log("Sending prompt:", completePrompt);

      const response = await imageService.uploadBatchImages(
        formData,
        handleUploadProgress
      );

      if (response && response.images) {
        localStorage.setItem("uploadResult", JSON.stringify(response));
        setTimeout(() => {
          setShowProgressScreen(false);
          navigate("/result");
        }, 1000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setShowProgressScreen(false);

      if (
        error.response &&
        error.response.data &&
        error.response.data.error === "Insufficient credits"
      ) {
        const { remaining_credits, requested_images } = error.response.data;
        setCreditsInfo({
          remainingCredits: remaining_credits,
          requestedImages: requested_images,
        });
        setShowCreditsModal(true);
      } else {
        setUploadError(
          error.message || "Failed to upload images. Please try again."
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,video/*,application/pdf";

    input.onchange = (e) => {
      if (e.target.files) {
        const fileArray = Array.from(e.target.files);
        onDrop(fileArray);
      }
    };
    input.click();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(Array.from(e.dataTransfer.files));
    }
  };

  const enabledSettingsCount = Object.values(settings).filter(Boolean).length;
  const showPreviews = files.length > 0;
  const limitations = [
    { label: "Max batch", value: "500 files" },
    { label: "Max photo size", value: "40MB" },
    { label: "Supported formats", value: "JPG, PNG" },
  ];

  const closeCreditsModal = () => {
    setShowCreditsModal(false);
  };

  // Show progress screen if uploading
  if (showProgressScreen) {
    return (
      <AdvancedProgressLoadingScreen
        progress={uploadProgress}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-gray-800 relative overflow-hidden"
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

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundSize: "15px 15px sm:20px 20px lg:25px 25px xl:30px 30px",
          backgroundImage: `linear-gradient(to right, #7D5BC6 1px, transparent 1px), linear-gradient(to bottom, #7D5BC6 1px, transparent 1px)`,
        }}
      ></div>

      {/* Mobile settings overlay */}
      {mobileSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <div className="p-4 border-b" style={{ borderColor: "#EDE4FF" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Settings</h3>
                <button
                  onClick={toggleMobileSettings}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <CustomInput
                label="Album Name"
                placeholder="Untitled Album"
                icon={<Upload size={18} />}
                value={albumName}
                onChange={updateAlbumName}
              />

              <div className="relative">
                <CustomInput
                  label="Prompt (optional)"
                  placeholder="Add details about your photos to improve tag quality..."
                  multiline={true}
                  rows={3}
                  value={prompt}
                  onChange={updatePrompt}
                />

                <button
                  onClick={togglePromptPreview}
                  className="absolute bottom-2 right-2 transition-colors p-1 rounded-full hover:bg-gray-100"
                  title="Preview complete prompt with settings"
                  style={{ color: "#7D5BC6" }}
                >
                  <Info size={18} />
                </button>
              </div>

              {showPromptPreview && (
                <div
                  className="p-3 border rounded-lg text-sm"
                  style={{
                    backgroundColor: "#EDE4FF",
                    borderColor: "#7D5BC6",
                  }}
                >
                  <div
                    className="font-semibold mb-1"
                    style={{ color: "#7D5BC6" }}
                  >
                    Complete prompt preview:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700">
                    {buildCompletePrompt() ||
                      "(No prompt or settings selected)"}
                  </div>
                </div>
              )}

              <CustomDropdown
                topic="General Settings"
                optionNumber={1}
                settings={settings}
                onToggle={updateSettings}
              />

              <CustomDropdown
                topic="Title and Description Settings"
                optionNumber={2}
                settings={settings}
                onToggle={updateSettings}
              />

              <CustomDropdown
                topic="Keywords Settings"
                optionNumber={3}
                settings={settings}
                onToggle={updateSettings}
              />
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={closeCreditsModal}
        remainingCredits={creditsInfo.remainingCredits}
        requestedImages={creditsInfo.requestedImages}
      />

      <div className="max-w-7xl mx-auto relative px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10 text-center">
          <div
            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border mb-3 sm:mb-4 shadow-sm"
            style={{
              backgroundColor: "#EDE4FF",
              borderColor: "#7D5BC6",
            }}
          >
            <Sparkles size={14} className="mr-2" style={{ color: "#7D5BC6" }} />
            <span
              className="text-xs sm:text-sm font-bold"
              style={{ color: "#7D5BC6" }}
            >
              AI-Powered Image Tagging
            </span>
          </div>

          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black mb-2"
            style={{ color: "#7D5BC6" }}
          >
            Upload Your Images
          </h1>
          <div
            className="h-1 w-16 sm:w-20 md:w-24 lg:w-28 rounded-full mx-auto"
            style={{ backgroundColor: "#7D5BC6" }}
          ></div>
        </div>

        {/* File limitations */}
        <div className="mb-6 sm:mb-8">
          <FileLimitation limitations={limitations} />
        </div>

        {/* Error message display */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base shadow-sm">
            {uploadError}
          </div>
        )}

        {/* Mobile settings button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={toggleMobileSettings}
            className="w-full flex items-center justify-between p-4 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#EDE4FF",
            }}
          >
            <div className="flex items-center gap-3">
              <Menu size={20} style={{ color: "#7D5BC6" }} />
              <span className="font-bold text-gray-800">Settings</span>
              {enabledSettingsCount > 0 && (
                <span
                  className="text-white text-xs px-2 py-1 rounded-full font-bold"
                  style={{ backgroundColor: "#7D5BC6" }}
                >
                  {enabledSettingsCount}
                </span>
              )}
            </div>
            <ChevronDown size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Settings Panel - Desktop only */}
          <div className="hidden lg:block w-full lg:w-2/5">
            <div className="relative group h-full">
              <div
                className="relative h-full p-4 sm:p-6 rounded-2xl border shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EDE4FF",
                }}
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div
                    className="w-1 h-6 sm:h-8 rounded-full"
                    style={{ backgroundColor: "#7D5BC6" }}
                  ></div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Settings
                  </h2>

                  {enabledSettingsCount > 0 && (
                    <span
                      className="ml-auto text-white text-xs px-2 py-1 rounded-full font-bold"
                      style={{ backgroundColor: "#7D5BC6" }}
                    >
                      {enabledSettingsCount} active
                    </span>
                  )}
                </div>

                <CustomInput
                  label="Album Name"
                  placeholder="Untitled Album"
                  icon={<Upload size={18} />}
                  value={albumName}
                  onChange={updateAlbumName}
                />

                <div className="relative mb-4 sm:mb-6">
                  <CustomInput
                    label="Prompt (optional)"
                    placeholder="Add details about your photos to improve tag quality..."
                    multiline={true}
                    rows={3}
                    value={prompt}
                    onChange={updatePrompt}
                  />

                  <button
                    onClick={togglePromptPreview}
                    className="absolute bottom-2 right-2 transition-colors p-1 rounded-full hover:bg-gray-100"
                    title="Preview complete prompt with settings"
                    style={{ color: "#7D5BC6" }}
                  >
                    <Info size={18} />
                  </button>
                </div>

                {showPromptPreview && (
                  <div
                    className="mb-4 sm:mb-6 p-3 border rounded-lg text-sm"
                    style={{
                      backgroundColor: "#EDE4FF",
                      borderColor: "#7D5BC6",
                    }}
                  >
                    <div
                      className="font-semibold mb-1"
                      style={{ color: "#7D5BC6" }}
                    >
                      Complete prompt preview:
                    </div>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {buildCompletePrompt() ||
                        "(No prompt or settings selected)"}
                    </div>
                  </div>
                )}

                <CustomDropdown
                  topic="General Settings"
                  optionNumber={1}
                  settings={settings}
                  onToggle={updateSettings}
                />

                <CustomDropdown
                  topic="Title and Description Settings"
                  optionNumber={2}
                  settings={settings}
                  onToggle={updateSettings}
                />

                <CustomDropdown
                  topic="Keywords Settings"
                  optionNumber={3}
                  settings={settings}
                  onToggle={updateSettings}
                />
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="w-full lg:w-3/5">
            <div className="relative group h-full">
              <div
                className="h-full relative overflow-hidden rounded-2xl border shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col min-h-[350px] sm:min-h-[400px] md:min-h-[450px] lg:min-h-[500px]"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#EDE4FF",
                }}
              >
                {/* Decorative elements */}
                <div
                  className="absolute -top-16 -right-16 sm:-top-32 sm:-right-32 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] rounded-full blur-3xl opacity-20"
                  style={{ backgroundColor: "#7D5BC6" }}
                ></div>
                <div
                  className="absolute -bottom-16 -left-16 sm:-bottom-32 sm:-left-32 w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] rounded-full blur-3xl opacity-20"
                  style={{ backgroundColor: "#7D5BC6" }}
                ></div>

                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center"
                  style={{
                    backgroundColor: "#EDE4FF",
                    borderColor: "#7D5BC6",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-6 sm:h-8 rounded-full"
                      style={{ backgroundColor: "#7D5BC6" }}
                    ></div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-800">
                      {showPreviews
                        ? `Selected Files (${files.length})`
                        : "Upload Files"}
                    </h3>
                  </div>

                  {showPreviews && (
                    <button
                      onClick={clearAllFiles}
                      className="flex items-center gap-1 text-xs sm:text-sm px-2 py-1 rounded-lg transition-colors shadow-sm hover:shadow-md"
                      style={{
                        color: "#7D5BC6",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <X size={14} />
                      <span className="hidden sm:inline">Clear All</span>
                    </button>
                  )}
                </div>

                <div
                  className="flex-1 p-4 sm:p-6 overflow-auto relative"
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {!showPreviews ? (
                    <div
                      className={`flex flex-col items-center justify-center h-full text-center p-4 sm:p-8 
                      border-2 border-dashed rounded-xl transition-all duration-300 ${
                        isDragActive
                          ? "border-purple-500 shadow-lg"
                          : "border-gray-300 hover:border-purple-400"
                      }`}
                      style={{
                        backgroundColor: isDragActive ? "#EDE4FF" : "#FFFEFF",
                        borderColor: isDragActive ? "#7D5BC6" : "#D1D5DB",
                      }}
                    >
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center rounded-full shadow-md"
                        style={{ backgroundColor: "#EDE4FF" }}
                      >
                        <Upload
                          size={24}
                          className="animate-pulse sm:w-8 sm:h-8"
                          style={{ color: "#7D5BC6" }}
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                        {isDragActive ? "Drop files here" : "Drag & Drop Files"}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm">
                        Upload images, videos or PDFs to generate AI tags. You
                        can select multiple files at once.
                      </p>
                      <button
                        onClick={handleFileSelect}
                        className="cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-white font-bold 
                        transition-all duration-300 flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        style={{ backgroundColor: "#7D5BC6" }}
                      >
                        <Upload size={16} />
                        Choose Files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="group relative aspect-square rounded-xl overflow-hidden border hover:border-purple-300 
                            transition-all duration-300 hover:shadow-md hover:-translate-y-1"
                            style={{ borderColor: "#EDE4FF" }}
                          >
                            {file.type.startsWith("image/") ? (
                              <img
                                src={file.preview}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4"
                                style={{ backgroundColor: "#EDE4FF" }}
                              >
                                <p className="font-bold text-center text-xs sm:text-sm text-gray-800 line-clamp-2">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500 text-center mt-1">
                                  {file.type.split("/")[0]}
                                </p>
                              </div>
                            )}

                            <div
                              className="absolute bottom-0 left-0 right-0 backdrop-blur-sm p-1.5 sm:p-2 
                              flex justify-between items-center transition-all duration-300 h-6 sm:h-8 group-hover:h-8 sm:group-hover:h-10"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                              }}
                            >
                              <p className="text-gray-800 text-xs truncate max-w-[70%] sm:max-w-[80%] font-medium">
                                {file.name}
                              </p>
                              <button
                                onClick={() => removeFile(file)}
                                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                style={{ color: "#7D5BC6" }}
                              >
                                <X size={12} className="sm:w-3.5 sm:h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={handleFileSelect}
                          className="aspect-square rounded-xl border-2 border-dashed 
                          flex flex-col items-center justify-center transition-all duration-300 hover:border-purple-400 hover:shadow-md"
                          style={{
                            backgroundColor: "#EDE4FF",
                            borderColor: "#7D5BC6",
                          }}
                        >
                          <Upload
                            size={16}
                            className="mb-1 sm:mb-2 sm:w-5 sm:h-5"
                            style={{ color: "#7D5BC6" }}
                          />
                          <p
                            className="text-xs sm:text-sm font-bold"
                            style={{ color: "#7D5BC6" }}
                          >
                            Add More
                          </p>
                        </button>
                      </div>

                      {isDragActive && (
                        <div
                          className="absolute inset-0 backdrop-blur-sm 
                          flex items-center justify-center border-3 border-dashed rounded-xl z-10"
                          style={{
                            backgroundColor: "rgba(237, 228, 255, 0.8)",
                            borderColor: "#7D5BC6",
                          }}
                        >
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                            Drop to Add Files
                          </h3>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3"
                  style={{
                    backgroundColor: "#EDE4FF",
                    borderColor: "#7D5BC6",
                  }}
                >
                  <button
                    onClick={handleFileSelect}
                    className="cursor-pointer w-full sm:w-auto px-4 py-2.5 sm:py-2 border rounded-lg
                    transition-all duration-300 text-sm sm:text-base font-bold shadow-sm hover:shadow-md"
                    style={{
                      borderColor: "#7D5BC6",
                      color: "#7D5BC6",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    Select Files
                  </button>

                  <button
                    onClick={handleGenerate}
                    disabled={files.length === 0 || isUploading}
                    className={`cursor-pointer w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base font-bold shadow-md hover:shadow-lg
                    ${
                      files.length === 0 || isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "text-white transform hover:-translate-y-0.5"
                    }`}
                    style={{
                      backgroundColor:
                        files.length === 0 || isUploading
                          ? "#D1D5DB"
                          : "#7D5BC6",
                    }}
                  >
                    {isUploading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-1"
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
                        <span className="hidden sm:inline">Processing...</span>
                        <span className="sm:hidden">Processing</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Generate Tags</span>
                        <span className="sm:hidden">Generate</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUploadPage;
