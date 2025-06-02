// ImageGallery.js - Professional White Theme
"use client";

import { useState, useEffect } from "react";

const ImageGallery = ({ images, onSelectImage }) => {
  const [selectedImage, setSelectedImage] = useState(
    images.find((img) => img.isMain) || images[0]
  );
  const [isMobile, setIsMobile] = useState(false);

  // Update selected image when images prop changes
  useEffect(() => {
    const mainImage = images.find((img) => img.isMain) || images[0];
    setSelectedImage(mainImage);
  }, [images]);

  // Check if we're on mobile for responsive adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectImage = (image) => {
    setSelectedImage(image);
    if (onSelectImage) {
      onSelectImage(image.id);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-2 md:px-4">
      {/* Main Image Container */}
      <div
        className="relative rounded-2xl border overflow-hidden mb-2 flex-grow shadow-lg hover:shadow-xl transition-shadow duration-300"
        style={{
          height: isMobile ? "calc(70vh - 50px)" : "calc(70vh - 40px)",
          minHeight: "350px",
          backgroundColor: "#FFFFFF",
          borderColor: "#EDE4FF",
        }}
      >
        {/* Blurred background image */}
        <div
          className="absolute inset-0 w-full h-full z-0 opacity-20"
          style={{
            backgroundImage: `url(${selectedImage?.src || "/placeholder.svg"})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            filter: "blur(20px) brightness(0.9)",
          }}
        />

        {/* File name indicator */}
        <div
          className="absolute top-4 right-4 text-white px-3 py-1.5 rounded-full text-sm flex items-center z-10 shadow-lg"
          style={{ backgroundColor: "#7D5BC6" }}
        >
          <span className="mr-1">🖼️</span>
          <span>
            {selectedImage?.id
              ? `image-${selectedImage.id.substring(0, 8)}`
              : "image"}
            .jpg
          </span>
        </div>

        {/* Main Image */}
        <div className="flex justify-center items-center h-full relative z-5 p-4">
          <img
            src={selectedImage?.src || "/placeholder.svg"}
            alt={selectedImage?.alt || "Image"}
            className="max-h-full max-w-full object-contain transition-all duration-300 hover:scale-105 shadow-lg rounded-lg"
          />
        </div>
      </div>

      {/* Caption for desktop */}
      {!isMobile && (
        <div className="text-sm text-gray-600 text-center mb-2 font-medium">
          {selectedImage?.alt || "Image"}
        </div>
      )}

      {/* Thumbnails Container */}
      <div className="w-full" style={{ maxHeight: isMobile ? "25vh" : "20vh" }}>
        <div
          className={`
          flex ${
            isMobile
              ? "flex-nowrap overflow-x-auto"
              : "flex-wrap justify-center"
          } 
          gap-2 w-full max-w-3xl mx-auto
        `}
        >
          {images.map((image) => (
            <div
              key={image.id}
              className="flex flex-col items-center flex-shrink-0"
              style={{
                width: isMobile ? "80px" : "85px",
                margin: isMobile ? "2px" : "2px 4px 8px",
              }}
            >
              {/* Thumbnail Image */}
              <div
                onClick={() => handleSelectImage(image)}
                className={`
                  relative rounded-xl cursor-pointer border-2 transition-all duration-200 w-full aspect-square shadow-md hover:shadow-lg
                  ${
                    selectedImage?.id === image.id
                      ? "shadow-lg"
                      : "hover:shadow-md"
                  }
                `}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderColor:
                    selectedImage?.id === image.id ? "#7D5BC6" : "#EDE4FF",
                  boxShadow:
                    selectedImage?.id === image.id
                      ? "0 8px 16px -4px rgba(125, 91, 198, 0.3), 0 4px 8px -2px rgba(125, 91, 198, 0.1)"
                      : "0 4px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div className="w-full h-full flex items-center justify-center p-2">
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt || "Image thumbnail"}
                    className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Caption below thumbnail */}
              <div className="mt-1 text-xs line-clamp-1 text-gray-600 text-center w-full font-medium">
                {isMobile
                  ? (image.alt || "Image").substring(0, 16) +
                    ((image.alt || "Image").length > 16 ? "..." : "")
                  : (image.alt || "Image").substring(0, 20) +
                    ((image.alt || "Image").length > 20 ? "..." : "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
