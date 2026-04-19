"use client";

import { motion } from "framer-motion";
import { useVibely } from "@/lib/store";
import { TRENDING_SEARCHES } from "@/lib/mock-data";
import { timeAgo } from "@/lib/types";

export default function LandingView() {
  const { setQuery, setAppState, searchHistory } = useVibely();

  const handleTrendingClick = (search: string) => {
    setQuery(search);
    setAppState("typing");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-5 pt-24 md:pt-32 pb-40">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-10 md:mb-14"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-4">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            search short-form by{" "}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              color: "var(--accent)",
            }}
          >
            vibe
          </span>
        </h1>
        <p className="text-ink4 text-base md:text-lg max-w-md mx-auto leading-relaxed">
          describe what you remember — we&apos;ll find it
        </p>
      </motion.div>

      {/* Trending Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 px-2 mb-3">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 12l3-4 3 2 4-6"
              stroke="var(--ink3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium uppercase tracking-wider text-ink3">
            Trending
          </span>
        </div>

        <div className="v-card rounded-2xl overflow-hidden">
          {TRENDING_SEARCHES.map((search, i) => (
            <motion.button
              key={search}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
              onClick={() => handleTrendingClick(search)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-bg/60 transition-colors group"
              style={{
                borderBottom:
                  i < TRENDING_SEARCHES.length - 1
                    ? "1px solid var(--line)"
                    : "none",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-ink4"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-sm text-ink2 flex-1">{search}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="shrink-0 text-ink4 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <path
                  d="M2 10L10 2M10 2H4M10 2v6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="w-full max-w-md mt-8"
        >
          <div className="flex items-center gap-2 px-2 mb-3">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="var(--ink3)" strokeWidth="1.5" />
              <path d="M8 5v3.5l2.5 1.5" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider text-ink3">
              Recent
            </span>
          </div>

          <div className="space-y-1">
            {searchHistory.slice(0, 3).map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                onClick={() => {
                  setQuery(item.query);
                  setAppState("typing");
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-card transition-colors"
              >
                <span className="text-sm text-ink2">{item.query}</span>
                <span className="text-xs text-ink4">{timeAgo(item.timestamp)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
