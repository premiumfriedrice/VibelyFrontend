"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVibely } from "@/lib/store";
import { formatCount, matchPercent, ProductResult } from "@/lib/types";
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
  } = useVibely();

  const [showFullCaption, setShowFullCaption] = useState(false);
  const [investigateState, setInvestigateState] = useState<
    "idle" | "loading" | "results"
  >("idle");
  const [products, setProducts] = useState<ProductResult[]>([]);

  if (!selectedResult) return null;

  const result = selectedResult;
  const saved = isSaved(result.content_id);

  const handleInvestigate = async () => {
    setInvestigateState("loading");
    try {
      // Fetch thumbnail as blob and send to products API
      const res = await fetch(result.thumb);
      const blob = await res.blob();
      const results = await investigateProducts(blob);
      setProducts(results);
      setInvestigateState("results");
    } catch {
      // Fallback to mock products
      console.warn("Products API unreachable, using demo data");
      setProducts(MOCK_PRODUCTS);
      setInvestigateState("results");
    }
  };

  const handleClose = () => {
    setShowDetail(false);
    setSelectedResult(null);
    setInvestigateState("idle");
    setShowFullCaption(false);
    setProducts([]);
  };

  return (
    <AnimatePresence>
      {showDetail && (
        <>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "var(--accent-soft)",
                  color: "var(--accent)",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 0l1.5 4H12l-3.5 2.5L10 11 6 8l-4 3 1.5-4.5L0 4h4.5z" />
                </svg>
                {matchPercent(result.score)}
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
              <div className="relative aspect-[9/12] md:aspect-[9/10] w-full bg-bg3 overflow-hidden">
                <img
                  src={result.thumb}
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
                  {investigateState === "idle" && (
                    <button
                      onClick={handleInvestigate}
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
                        Analyzing content...
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
                      <div className="grid grid-cols-2 gap-3">
                        {products.map((product) => (
                          <div
                            key={product.id}
                            className="v-card rounded-xl overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-square bg-bg3 overflow-hidden">
                              <img
                                src={product.imageURL}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
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
                          </div>
                        ))}
                      </div>
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
                    {RELATED_CONTENT.map((item) => (
                      <button
                        key={item.content_id}
                        onClick={() => {
                          setShowFullCaption(false);
                          setInvestigateState("idle");
                          // Update selected result inline
                          // Using the store setter via the parent
                        }}
                        className="shrink-0 relative w-20 h-28 rounded-xl overflow-hidden bg-bg3 group"
                      >
                        <img
                          src={item.thumb}
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
