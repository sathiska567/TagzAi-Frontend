/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from "react";

const UltraModernProgressScreen = ({ progress, isUploading = false }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState("uploading");
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [energy, setEnergy] = useState(0);
  const [screenSize, setScreenSize] = useState("desktop");
  const [time, setTime] = useState(0);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  // Professional tips without emojis
  const uploadingTips = [
    "Securely transmitting your files through encrypted channels...",
    "Optimizing data streams for maximum efficiency...",
    "Establishing secure connection to processing servers...",
    "Validating file integrity and structure...",
    "Preparing files for AI analysis pipeline...",
    "Transferring data using industry-standard protocols...",
    "Initializing upload sequence with error checking...",
    "Compressing and packaging files for transmission...",
  ];

  const processingTips = [
    "AI algorithms analyzing visual content patterns...",
    "Neural networks extracting meaningful metadata...",
    "Deep learning models generating accurate descriptions...",
    "Computer vision processing image characteristics...",
    "Natural language processing creating SEO-friendly tags...",
    "Machine learning optimizing keyword relevance...",
    "Advanced algorithms ensuring content accuracy...",
    "AI systems finalizing professional metadata output...",
  ];

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;

      if (width < 480) {
        setScreenSize("mobile-xs");
      } else if (width < 640) {
        setScreenSize("mobile");
      } else if (width < 768) {
        setScreenSize("mobile-lg");
      } else if (width < 1024) {
        setScreenSize(aspectRatio > 1.3 ? "tablet-landscape" : "tablet");
      } else if (width < 1280) {
        setScreenSize("laptop");
      } else if (width < 1920) {
        setScreenSize("desktop");
      } else {
        setScreenSize("desktop-xl");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Time-based animations
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now() * 0.001);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  // Phase detection
  useEffect(() => {
    if (progress && progress.processed > 0) {
      setUploadPhase("processing");
    } else if (progress && progress.total > 0) {
      setUploadPhase("uploading");
    } else if (isUploading) {
      setUploadPhase("uploading");
    }
  }, [progress, isUploading]);

  const displayProgress = progress?.percentage || 0;
  const currentProcessed = progress?.processed || 0;
  const totalFiles = progress?.total || 0;
  const remainingFiles = progress?.remaining || 0;

  const currentTips =
    uploadPhase === "uploading" ? uploadingTips : processingTips;

  // Mouse tracking for desktop
  useEffect(() => {
    if (screenSize.includes("mobile")) return;

    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 100,
          y: (e.clientY / window.innerHeight) * 100,
        });
        rafId = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [screenSize]);

  // Energy calculation
  useEffect(() => {
    const targetEnergy = Math.min(
      100,
      (animatedProgress || 0) + Math.sin(time) * 15 + 15
    );
    setEnergy(targetEnergy);
  }, [animatedProgress, time]);

  // Tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % currentTips.length);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, [currentTips.length]);

  // Progress animation
  useEffect(() => {
    const targetProgress = displayProgress;
    const duration = 1500;
    const startTime = Date.now();
    const startProgress = animatedProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Smooth easing
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progressRatio);
      const currentProgress =
        startProgress + (targetProgress - startProgress) * easedProgress;
      setAnimatedProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [displayProgress, animatedProgress]);

  // Professional particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    const getParticleConfig = () => {
      const configs = {
        "mobile-xs": { count: 8, connections: 2, speed: 0.2 },
        mobile: { count: 12, connections: 3, speed: 0.3 },
        "mobile-lg": { count: 18, connections: 4, speed: 0.4 },
        tablet: { count: 30, connections: 6, speed: 0.6 },
        "tablet-landscape": { count: 40, connections: 8, speed: 0.7 },
        laptop: { count: 50, connections: 10, speed: 0.8 },
        desktop: { count: 70, connections: 12, speed: 1.0 },
        "desktop-xl": { count: 100, connections: 15, speed: 1.2 },
      };
      return configs[screenSize] || configs.desktop;
    };

    const config = getParticleConfig();

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < config.count; i++) {
        particlesRef.current.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          life: Math.random() * 100,
          maxLife: 100,
          energy: Math.random(),
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const animateParticles = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "screen";

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        particle.pulse += 0.03;
        particle.energy = Math.sin(time + index * 0.1) * 0.3 + 0.7;

        if (particle.x < 0) particle.x = rect.width;
        if (particle.x > rect.width) particle.x = 0;
        if (particle.y < 0) particle.y = rect.height;
        if (particle.y > rect.height) particle.y = 0;

        if (particle.life <= 0) {
          particle.x = Math.random() * rect.width;
          particle.y = Math.random() * rect.height;
          particle.life = particle.maxLife;
        }

        const alpha =
          (particle.life / particle.maxLife) *
          particle.energy *
          particle.opacity;
        const dynamicSize =
          particle.size * (1 + Math.sin(particle.pulse) * 0.2);

        // Professional purple particles
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillStyle = `rgba(125, 91, 198, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, dynamicSize, 0, Math.PI * 2);
        ctx.fill();

        // Connections
        particlesRef.current
          .slice(index + 1, index + 1 + config.connections)
          .forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = screenSize.includes("mobile") ? 50 : 100;

            if (distance < maxDistance) {
              const connectionAlpha =
                (1 - distance / maxDistance) *
                alpha *
                otherParticle.energy *
                0.3;
              ctx.globalAlpha = connectionAlpha;
              ctx.strokeStyle = `rgba(125, 91, 198, ${connectionAlpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.stroke();
            }
          });
      });

      ctx.globalCompositeOperation = "source-over";
      animationRef.current = requestAnimationFrame(animateParticles);
    };

    initParticles();
    animateParticles();

    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * dpr;
      canvas.height = newRect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = newRect.width + "px";
      canvas.style.height = newRect.height + "px";
      initParticles();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [screenSize, time]);

  const responsiveStyles = useMemo(() => {
    const styles = {
      "mobile-xs": {
        outerCircleSize: 45,
        circleSize: 35,
        innerCircleSize: 25,
        containerSize: "w-36 h-36",
        textSizes: {
          heroTitle: "text-sm",
          heroSubtitle: "text-xs",
          percentage: "text-base",
          fileCount: "text-xs",
        },
      },
      mobile: {
        outerCircleSize: 50,
        circleSize: 40,
        innerCircleSize: 30,
        containerSize: "w-40 h-40",
        textSizes: {
          heroTitle: "text-base",
          heroSubtitle: "text-xs",
          percentage: "text-lg",
          fileCount: "text-xs",
        },
      },
      "mobile-lg": {
        outerCircleSize: 55,
        circleSize: 45,
        innerCircleSize: 35,
        containerSize: "w-44 h-44",
        textSizes: {
          heroTitle: "text-base",
          heroSubtitle: "text-sm",
          percentage: "text-xl",
          fileCount: "text-sm",
        },
      },
      tablet: {
        outerCircleSize: 60,
        circleSize: 50,
        innerCircleSize: 40,
        containerSize: "w-48 h-48",
        textSizes: {
          heroTitle: "text-lg",
          heroSubtitle: "text-sm",
          percentage: "text-2xl",
          fileCount: "text-sm",
        },
      },
      "tablet-landscape": {
        outerCircleSize: 65,
        circleSize: 55,
        innerCircleSize: 45,
        containerSize: "w-52 h-52",
        textSizes: {
          heroTitle: "text-xl",
          heroSubtitle: "text-base",
          percentage: "text-3xl",
          fileCount: "text-base",
        },
      },
      laptop: {
        outerCircleSize: 70,
        circleSize: 60,
        innerCircleSize: 50,
        containerSize: "w-56 h-56",
        textSizes: {
          heroTitle: "text-xl",
          heroSubtitle: "text-base",
          percentage: "text-3xl",
          fileCount: "text-base",
        },
      },
      desktop: {
        outerCircleSize: 75,
        circleSize: 65,
        innerCircleSize: 55,
        containerSize: "w-60 h-60",
        textSizes: {
          heroTitle: "text-2xl",
          heroSubtitle: "text-base",
          percentage: "text-4xl",
          fileCount: "text-base",
        },
      },
      "desktop-xl": {
        outerCircleSize: 80,
        circleSize: 70,
        innerCircleSize: 60,
        containerSize: "w-64 h-64",
        textSizes: {
          heroTitle: "text-2xl",
          heroSubtitle: "text-lg",
          percentage: "text-5xl",
          fileCount: "text-lg",
        },
      },
    };
    return styles[screenSize] || styles.desktop;
  }, [screenSize]);

  const circumference = 2 * Math.PI * responsiveStyles.outerCircleSize;
  const strokeDashoffset =
    circumference - (animatedProgress / 100) * circumference;

  const progressAngle = (animatedProgress / 100) * 2 * Math.PI - Math.PI / 2;
  const dotX = 100 + responsiveStyles.outerCircleSize * Math.cos(progressAngle);
  const dotY = 100 + responsiveStyles.outerCircleSize * Math.sin(progressAngle);

  // Professional background
  const dynamicBackground = useMemo(() => {
    if (screenSize.includes("mobile")) {
      return "#FFFEFF";
    }
    return `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(125, 91, 198, 0.1) 0%, rgba(237, 228, 255, 0.05) 50%, transparent 100%), #FFFEFF`;
  }, [mousePosition, screenSize]);

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Professional background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: dynamicBackground }}
      />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 opacity-60"
        style={{
          width: "100%",
          height: "100%",
          filter: `blur(${screenSize.includes("mobile") ? "0.5px" : "1px"})`,
        }}
      />

      {/* Floating elements */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        {[...Array(screenSize.includes("mobile") ? 3 : 6)].map((_, i) => (
          <div
            key={`floating-${i}`}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${10 + ((i * 15 + Math.sin(time + i)) % 70)}%`,
              top: `${15 + ((i * 13 + Math.cos(time + i * 0.8)) % 70)}%`,
              width: `${8 + Math.sin(time + i) * 4}px`,
              height: `${8 + Math.sin(time + i) * 4}px`,
              backgroundColor: "#7D5BC6",
              transform: `scale(${1 + Math.sin(time + i) * 0.2})`,
              animation: `float 4s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-30 flex items-center justify-center min-h-screen py-4 px-4">
        <div className="text-center w-full max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div
            className={`relative mb-6 ${responsiveStyles.containerSize} mx-auto`}
          >
            {/* Glassmorphism container */}
            <div
              className="absolute inset-0 rounded-full border shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "#EDE4FF",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* SVG Progress */}
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <defs>
                  <linearGradient
                    id="progressGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#7D5BC6" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="4"
                      floodColor="#7D5BC6"
                      floodOpacity="0.3"
                    />
                  </filter>
                </defs>

                {/* Background ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={responsiveStyles.outerCircleSize}
                  stroke="#EDE4FF"
                  strokeWidth="8"
                  fill="none"
                  opacity="0.5"
                />

                {/* Progress ring */}
                <circle
                  cx="100"
                  cy="100"
                  r={responsiveStyles.outerCircleSize}
                  stroke="#7D5BC6"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-[1500ms] ease-out"
                  transform="rotate(-90 100 100)"
                  filter="url(#shadow)"
                />

                {/* Progress dot */}
                {displayProgress > 2 && (
                  <circle
                    cx={dotX}
                    cy={dotY}
                    r="6"
                    fill="#7D5BC6"
                    className="transition-all duration-[1500ms] ease-out shadow-lg"
                  />
                )}

                {/* Center elements */}
                <circle cx="100" cy="100" r="3" fill="#7D5BC6" opacity="0.8" />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-2">
                  {displayProgress === 0 && isUploading ? (
                    <div className="text-gray-800">
                      <div
                        className={`relative ${
                          screenSize.includes("mobile") ? "w-6 h-6" : "w-8 h-8"
                        } mx-auto mb-2`}
                      >
                        <div
                          className="absolute inset-0 border-2 border-transparent rounded-full animate-spin"
                          style={{
                            borderTopColor: "#7D5BC6",
                            borderRightColor: "#7D5BC6",
                          }}
                        />
                      </div>
                      <div
                        className={`${responsiveStyles.textSizes.fileCount} font-bold mb-1`}
                        style={{ color: "#7D5BC6" }}
                      >
                        INITIALIZING
                      </div>
                      <div className="text-xs text-gray-600">
                        Starting Process
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`${responsiveStyles.textSizes.percentage} font-black mb-1`}
                      >
                        <span style={{ color: "#7D5BC6" }}>
                          {Math.round(displayProgress)}
                        </span>
                        <span className="text-gray-500">%</span>
                      </div>
                      <div
                        className={`${responsiveStyles.textSizes.fileCount} text-gray-800 font-semibold mb-1`}
                      >
                        {currentProcessed > 0
                          ? `${currentProcessed} of ${totalFiles} processed`
                          : `Processing ${totalFiles} files`}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {currentProcessed > 0
                          ? "AI Processing"
                          : "Upload Phase"}
                      </div>
                      <div
                        className={`${
                          screenSize.includes("mobile")
                            ? "w-12 h-1"
                            : "w-16 h-1"
                        } bg-gray-200 rounded-full mx-auto overflow-hidden`}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${displayProgress}%`,
                            backgroundColor: "#7D5BC6",
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title section */}
          <div className="mb-6">
            <h1
              className={`${responsiveStyles.textSizes.heroTitle} font-black mb-2 tracking-wide`}
              style={{ color: "#7D5BC6" }}
            >
              {uploadPhase === "uploading" ? "SECURE UPLOAD" : "AI PROCESSING"}
            </h1>
            <p
              className={`${responsiveStyles.textSizes.heroSubtitle} text-gray-600 font-medium tracking-wide px-4`}
            >
              {uploadPhase === "uploading"
                ? "Transferring files with enterprise-grade security"
                : "Advanced AI algorithms analyzing your content"}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-6 px-4">
            <div
              className={`relative w-full ${
                screenSize.includes("mobile") ? "h-2" : "h-3"
              } bg-gray-200 rounded-full overflow-hidden shadow-inner`}
            >
              <div
                className="h-full transition-all duration-1000 ease-out rounded-full shadow-md"
                style={{
                  width: `${displayProgress}%`,
                  backgroundColor: "#7D5BC6",
                }}
              />
            </div>

            <div
              className={`flex justify-between ${responsiveStyles.textSizes.fileCount} text-gray-600 mt-2 font-semibold`}
            >
              <span>START</span>
              <span>COMPLETE</span>
            </div>
          </div>

          {/* Tip section */}
          <div
            className="border rounded-xl p-4 mb-6 shadow-lg mx-4 relative overflow-hidden"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderColor: "#EDE4FF",
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <div
                className={`${
                  screenSize.includes("mobile") ? "w-6 h-6" : "w-8 h-8"
                } rounded-full flex items-center justify-center mr-3 shadow-md`}
                style={{ backgroundColor: "#7D5BC6" }}
              >
                <span className="text-white text-sm font-bold">
                  {uploadPhase === "uploading" ? "↑" : "⚡"}
                </span>
              </div>
              <span
                className={`${responsiveStyles.textSizes.fileCount} font-bold`}
                style={{ color: "#7D5BC6" }}
              >
                {uploadPhase === "uploading"
                  ? "UPLOAD STATUS"
                  : "AI PROCESSING"}
              </span>
            </div>
            <p
              key={`${uploadPhase}-${currentTip}`}
              className={`${responsiveStyles.textSizes.fileCount} text-gray-700 text-center leading-relaxed animate-fade-in font-medium px-2`}
            >
              {currentTips[currentTip]}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-6 px-4">
            {[
              {
                label: "Total",
                value: totalFiles,
                color: "#7D5BC6",
                icon: "📁",
              },
              {
                label: "Done",
                value: currentProcessed,
                color: "#10B981",
                icon: "✅",
              },
              {
                label: "Left",
                value: remainingFiles,
                color: "#6B7280",
                icon: "⏳",
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="border rounded-lg p-3 shadow-lg transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: "#EDE4FF",
                }}
              >
                <div className="text-center">
                  <div className="text-sm mb-1">{stat.icon}</div>
                  <div
                    className={`${
                      screenSize.includes("mobile") ? "text-lg" : "text-xl"
                    } font-black`}
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action icons */}
          <div className="flex justify-center space-x-4 px-4">
            {[
              { icon: "🔒", name: "SECURE", color: "#7D5BC6" },
              { icon: "⚡", name: "FAST", color: "#F59E0B" },
              { icon: "🎯", name: "PRECISE", color: "#10B981" },
              { icon: "🚀", name: "READY", color: "#EF4444" },
            ].map((item, index) => (
              <div
                key={item.name}
                className="flex flex-col items-center transform transition-all duration-300 hover:scale-110"
                style={{
                  animation: `float 3s ease-in-out infinite ${index * 0.5}s`,
                }}
              >
                <div className="text-lg mb-1">{item.icon}</div>
                <div
                  className="text-xs font-black tracking-wider"
                  style={{ color: item.color }}
                >
                  {screenSize.includes("mobile") && item.name.length > 5
                    ? item.name.substring(0, 4)
                    : item.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UltraModernProgressScreen;
