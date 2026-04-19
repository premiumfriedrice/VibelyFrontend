"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVibely } from "@/lib/store";
import { formatCount, resolveMediaUrl, ProductResult } from "@/lib/types";
import { MOCK_PRODUCTS, RELATED_CONTENT } from "@/lib/mock-data";
import { investigateProducts } from "@/lib/api";

export default function DetailModal() {
  const {
    selectedResult,
    showDetail,
    setShowDetail,
    setSelectedResult,
    toggleSaved,
    isSaved,
    results,
  } = useVibely();

  const [showFullCaption, setShowFullCaption] = useState(false);
  const [investigateState, setInvestigateState] = useState<
    "idle" | "loading" | "results"
  >("idle");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const result = selectedResult;
  const thumbUrl = result ? resolveMediaUrl(result.thumb) : "";
  const videoUrl = result ? resolveMediaUrl(result.video_url) : "";
  const hasVideo = !!result?.video_url;

  // Use other results as related content, excluding current
  const relatedContent = result
    ? results.filter((r) => r.content_id !== result.content_id).slice(0, 6)
    : [];
  const relatedItems = relatedContent.length > 0 ? relatedContent : RELATED_CONTENT;

  // Video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress(video.currentTime / video.duration);
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [hasVideo, showDetail, selectedResult]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPaused(false);
    } else {
      video.pause();
      setIsPaused(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * video.duration;
    setProgress(pct);
  }, []);

  const captureFrame = useCallback((): Blob | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedFrame(dataUrl);

    // Convert to blob
    const byteString = atob(dataUrl.split(",")[1]);
    const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }, []);

  const handleAnalyzeFrame = useCallback(async () => {
    const blob = captureFrame();
    if (!blob) return;

    setInvestigateState("loading");
    try {
      const results = await investigateProducts(blob);
      setProducts(results);
      setInvestigateState("results");
    } catch {
      console.warn("Products API unreachable, using demo data");
      setProducts(MOCK_PRODUCTS);
      setInvestigateState("results");
    }
  }, [captureFrame]);

  const handleInvestigateImage = useCallback(async () => {
    setInvestigateState("loading");
    try {
      const res = await fetch(thumbUrl);
      const blob = await res.blob();
      const results = await investigateProducts(blob);
      setProducts(results);
      setInvestigateState("results");
    } catch {
      console.warn("Products API unreachable, using demo data");
      setProducts(MOCK_PRODUCTS);
      setInvestigateState("results");
    }
  }, [thumbUrl]);

  const handleClose = () => {
    setShowDetail(false);
    setSelectedResult(null);
    setInvestigateState("idle");
    setShowFullCaption(false);
    setProducts([]);
    setIsPaused(false);
    setIsMuted(true);
    setProgress(0);
    setCapturedFrame(null);
  };

  if (!result) return null;
  const saved = isSaved(result.content_id);

  return (
    <AnimatePresence>
      {showDetail && (
        <>
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%", scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: "50%", scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-x-0 bottom-0 top-12 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-8 md:bottom-8 md:w-[520px] z-50 flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{ background: "var(--bg)" }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
              <button
                onClick={() => toggleSaved(result)}
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: saved ? "var(--accent)" : "var(--ink3)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill={saved ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 2h10v12l-5-3.5L3 14V2z" />
                </svg>
                {saved ? "Saved" : "Save"}
              </button>

              <span
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-display)", color: "var(--ink3)" }}
              >
                @{result.creator}
              </span>

              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-bg2 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="var(--ink3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Media */}
              <div className="relative aspect-[9/12] md:aspect-[9/10] w-full bg-black overflow-hidden">
                {hasVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      autoPlay
                      muted={isMuted}
                      loop
                      playsInline
                      className="w-full h-full object-contain bg-black"
                      onClick={togglePlayPause}
                    />

                    {/* Video overlay controls */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {/* Center play/pause indicator on tap */}
                      <AnimatePresence>
                        {isPaused && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
                            onClick={togglePlayPause}
                          >
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{
                                background: "rgba(0,0,0,0.5)",
                                backdropFilter: "blur(8px)",
                              }}
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <polygon points="8,5 20,12 8,19" />
                              </svg>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Bottom bar: progress + controls */}
                      <div className="mt-auto pointer-events-auto">
                        {/* "Analyze this frame" button — visible when paused */}
                        <AnimatePresence>
                          {isPaused && investigateState === "idle" && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 8 }}
                              className="flex justify-center mb-3"
                            >
                              <button
                                onClick={handleAnalyzeFrame}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium"
                                style={{
                                  background: "rgba(0,0,0,0.5)",
                                  backdropFilter: "blur(12px)",
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8 0l2 4.5H15l-4 3 1.5 4.5L8 9l-4.5 3L5 7.5l-4-3h5z" />
                                </svg>
                                Analyze this frame
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Progress bar + mute */}
                        <div
                          className="flex items-center gap-3 px-4 py-3"
                          style={{
                            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                          }}
                        >
                          {/* Play/pause small */}
                          <button onClick={togglePlayPause} className="shrink-0">
                            {isPaused ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                                <polygon points="3,1 13,7 3,13" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
                                <rect x="2" y="1" width="3.5" height="12" rx="1" />
                                <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
                              </svg>
                            )}
                          </button>

                          {/* Seek bar */}
                          <div
                            className="flex-1 h-1 rounded-full cursor-pointer relative"
                            style={{ background: "rgba(255,255,255,0.3)" }}
                            onClick={handleSeek}
                          >
                            <div
                              className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-100"
                              style={{ width: `${progress * 100}%` }}
                            />
                            <div
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md transition-[left] duration-100"
                              style={{ left: `calc(${progress * 100}% - 6px)` }}
                            />
                          </div>

                          {/* Mute toggle */}
                          <button onClick={toggleMute} className="shrink-0">
                            {isMuted ? (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 5.5h2.5L8 2.5v11l-3.5-3H2a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5z" fill="white" />
                                <path d="M11 5l4 4M15 5l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 5.5h2.5L8 2.5v11l-3.5-3H2a.5.5 0 01-.5-.5V6a.5.5 0 01.5-.5z" fill="white" />
                                <path d="M11 4.5a4 4 0 010 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M13 3a6.5 6.5 0 010 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </button>

                          {/* Platform badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-[10px] font-medium ${
                              result.platform === "instagram"
                                ? "badge-instagram"
                                : "badge-tiktok"
                            }`}
                          >
                            {result.platform === "tiktok" ? "TikTok" : "Instagram"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={thumbUrl}
                      alt={result.caption}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-24"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                      }}
                    />
                    {/* Platform badge */}
                    <div className="absolute bottom-4 left-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-xs font-medium ${
                          result.platform === "instagram"
                            ? "badge-instagram"
                            : "badge-tiktok"
                        }`}
                      >
                        {result.platform === "tiktok" ? "TikTok" : "Instagram"}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Body */}
              <div className="px-5 py-5">
                {/* Creator */}
                <p
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--accent)" }}
                >
                  @{result.creator}
                </p>

                {/* Caption */}
                <div className="mb-4">
                  <p className="text-sm text-ink2 leading-relaxed">
                    {showFullCaption || result.caption.length <= 100
                      ? result.caption
                      : result.caption.slice(0, 100) + "..."}
                  </p>
                  {result.caption.length > 100 && (
                    <button
                      onClick={() => setShowFullCaption(!showFullCaption)}
                      className="text-xs text-ink4 mt-1 hover:text-ink3 transition-colors"
                    >
                      {showFullCaption ? "less" : "more"}
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6 text-ink4">
                  <span className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polygon points="4,1 10,6 4,11" fill="currentColor" />
                    </svg>
                    {formatCount(result.views)} views
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M6 10.5s-5-3.5-5-6.5a3 3 0 015-2.2A3 3 0 0111 4c0 3-5 6.5-5 6.5z" />
                    </svg>
                    {formatCount(result.likes)} likes
                  </span>
                  {result.comments > 0 && (
                    <span className="flex items-center gap-1.5 text-xs">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M1 3a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H5l-2.5 2V9H3a2 2 0 01-2-2V3z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                      </svg>
                      {formatCount(result.comments)}
                    </span>
                  )}
                </div>

                {/* Investigate Section */}
                <div className="mb-6">
                  {/* Captured frame preview */}
                  <AnimatePresence>
                    {capturedFrame && investigateState !== "idle" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3"
                      >
                        <p className="text-xs font-medium uppercase tracking-wider text-ink3 mb-2">
                          Analyzed Frame
                        </p>
                        <div className="rounded-xl overflow-hidden border border-line" style={{ maxHeight: 160 }}>
                          <img
                            src={capturedFrame}
                            alt="Captured frame"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {investigateState === "idle" && !hasVideo && (
                    <button
                      onClick={handleInvestigateImage}
                      className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-white text-left transition-colors hover:opacity-90"
                      style={{ background: "var(--accent)" }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9 0l2 5.5H17l-5 3.5 2 5.5-5-4-5 4 2-5.5-5-3.5h6z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          Investigate this content
                        </p>
                        <p className="text-xs opacity-80 mt-0.5">
                          Find products and related items
                        </p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M5 3l4 4-4 4"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  {investigateState === "idle" && hasVideo && (
                    <div
                      className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-left"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="4.5" height="12" rx="1" fill="var(--accent)" />
                        <rect x="9.5" y="2" width="4.5" height="12" rx="1" fill="var(--accent)" />
                      </svg>
                      <p className="text-sm text-ink3">
                        Pause the video to analyze a frame for products
                      </p>
                    </div>
                  )}

                  {investigateState === "loading" && (
                    <div className="flex items-center justify-center gap-3 py-6">
                      <div className="w-5 h-5 relative">
                        <svg
                          className="w-5 h-5 spin-slow"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle
                            cx="10"
                            cy="10"
                            r="8"
                            stroke="var(--accent)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="16 34"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-ink3">
                        Analyzing frame for products...
                      </span>
                    </div>
                  )}

                  {investigateState === "results" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-xs font-medium uppercase tracking-wider text-ink3 mb-3">
                        Found Products
                      </p>
                      {products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {products.map((product) => (
                            <a
                              key={product.id}
                              href={product.productURL || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="v-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <div className="aspect-square bg-bg3 overflow-hidden">
                                {product.imageURL && (
                                  <img
                                    src={product.imageURL}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                              </div>
                              <div className="p-2.5">
                                <p className="text-xs font-medium text-ink2 line-clamp-2 leading-snug">
                                  {product.name}
                                </p>
                                <p className="text-sm font-semibold text-ink mt-1">
                                  {product.price}
                                </p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <span
                                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                    style={{
                                      background: "var(--bg2)",
                                      color: "var(--ink3)",
                                    }}
                                  >
                                    {product.source}
                                  </span>
                                  <span className="text-[10px] text-ink4">
                                    {product.groupName}
                                  </span>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-ink4 py-4 text-center">
                          No products detected in this frame
                        </p>
                      )}

                      {/* Analyze another frame */}
                      {hasVideo && (
                        <button
                          onClick={() => {
                            setInvestigateState("idle");
                            setProducts([]);
                            setCapturedFrame(null);
                          }}
                          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-ink3 transition-colors hover:bg-bg2"
                          style={{
                            background: "var(--card)",
                            border: "1px solid var(--line)",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M1 6a5 5 0 019-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M11 6a5 5 0 01-9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M10 1v2.5h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 11V8.5h2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Analyze another frame
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Open on platform */}
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-ink2 transition-colors hover:bg-bg2"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                  }}
                >
                  Open on{" "}
                  {result.platform === "tiktok" ? "TikTok" : "Instagram"}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 10L10 2M10 2H4M10 2v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                {/* Related Content */}
                <div className="mt-8 mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-ink3 mb-3">
                    Related
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                    {relatedItems.map((item) => (
                      <button
                        key={item.content_id}
                        onClick={() => {
                          setShowFullCaption(false);
                          setInvestigateState("idle");
                          setProducts([]);
                          setCapturedFrame(null);
                          setIsPaused(false);
                          setIsMuted(true);
                          setProgress(0);
                          setSelectedResult(item);
                        }}
                        className="shrink-0 relative w-20 h-28 rounded-xl overflow-hidden bg-bg3 group"
                      >
                        <img
                          src={resolveMediaUrl(item.thumb)}
                          alt={item.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div
                          className="absolute inset-x-0 bottom-0 p-1.5"
                          style={{
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                          }}
                        >
                          <p className="text-[9px] text-white font-medium truncate">
                            @{item.creator}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
