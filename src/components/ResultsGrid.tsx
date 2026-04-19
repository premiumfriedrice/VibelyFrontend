"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useVibely } from "@/lib/store";
import { formatCount, resolveMediaUrl, type Platform } from "@/lib/types";

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-white text-[10px] font-medium ${
        platform === "instagram" ? "badge-instagram" : "badge-tiktok"
      }`}
    >
      {platform === "tiktok" ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M8 1a3 3 0 01-2 2V8a3 3 0 11-3-3v1.5a1.5 1.5 0 101.5 1.5V1H6a2 2 0 002 2V1z" />
          </svg>
          TikTok
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="0.8" fill="none" />
            <circle cx="7.5" cy="2.5" r="0.6" fill="currentColor" />
          </svg>
          Instagram
        </>
      )}
    </span>
  );
}

function ResultCard({ result, index }: { result: ReturnType<typeof useVibely>["filteredResults"][0]; index: number }) {
  const { setSelectedResult, setShowDetail } = useVibely();
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbUrl = resolveMediaUrl(result.thumb);
  const videoUrl = resolveMediaUrl(result.video_url);
  const hasVideo = !!result.video_url;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <motion.button
      key={result.content_id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.04,
        duration: 0.4,
        type: "spring",
        stiffness: 260,
        damping: 24,
      }}
      onClick={() => {
        setSelectedResult(result);
        setShowDetail(true);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="text-left group"
    >
      <div className="v-card rounded-2xl overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail / Video */}
        <div className="relative aspect-[3/4] overflow-hidden bg-bg3">
          {hasVideo && (
            <video
              ref={videoRef}
              src={videoUrl}
              muted
              loop
              playsInline
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}
          <img
            src={thumbUrl}
            alt={result.caption}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Platform badge */}
          <div className="absolute top-2.5 left-2.5">
            <PlatformBadge platform={result.platform} />
          </div>
        </div>

        {/* Info */}
        <div className="px-3 py-2.5">
          <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
            @{result.creator}
          </p>
          <p className="text-xs text-ink2 mt-0.5 line-clamp-2 leading-relaxed">
            {result.caption}
          </p>
          <div className="flex items-center gap-3 mt-2 text-ink4">
            <span className="flex items-center gap-1 text-[10px]">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1.5 6.5l3-3.5 2.5 2L10.5 1.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M1.5 6.5v4h9v-4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              {formatCount(result.views)}
            </span>
            <span className="flex items-center gap-1 text-[10px]">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 10.5s-5-3.5-5-6.5a3 3 0 015-2.2A3 3 0 0111 4c0 3-5 6.5-5 6.5z" />
              </svg>
              {formatCount(result.likes)}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function ResultsGrid() {
  const {
    filteredResults,
    platformFilter,
    setPlatformFilter,
    query,
  } = useVibely();

  const filters: { label: string; value: Platform | null; icon?: string }[] = [
    { label: "All", value: null },
    { label: "TikTok", value: "tiktok", icon: "♪" },
    { label: "Instagram", value: "instagram", icon: "📷" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-20 md:pt-24 pb-36">
      {/* Results header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
      >
        <div>
          <p className="text-sm text-ink3">
            {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} for
          </p>
          <p className="text-lg text-ink font-medium" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;{query || "Visual search"}&rdquo;
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setPlatformFilter(f.value)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background:
                  platformFilter === f.value ? "var(--ink)" : "var(--card)",
                color:
                  platformFilter === f.value ? "var(--card)" : "var(--ink2)",
                border: `1px solid ${
                  platformFilter === f.value ? "var(--ink)" : "var(--line)"
                }`,
              }}
            >
              {f.icon && <span className="mr-1">{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {filteredResults.map((result, i) => (
          <ResultCard key={result.content_id} result={result} index={i} />
        ))}
      </div>
    </div>
  );
}
