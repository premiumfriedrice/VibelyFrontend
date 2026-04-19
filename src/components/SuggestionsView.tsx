"use client";

import { motion } from "framer-motion";
import { useVibely } from "@/lib/store";
import { TRENDING_SEARCHES } from "@/lib/mock-data";

export default function SuggestionsView() {
  const { query, setQuery, attachments, performSearch } = useVibely();

  // If user has attachments, show attachment-ready state
  if (attachments.length > 0 && !query.trim()) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-8 pt-32 pb-40 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          {attachments.map((att) => (
            <span
              key={att.id}
              className="text-2xl"
              style={{ color: "var(--accent)" }}
            >
              {att.type === "image"
                ? "🖼"
                : att.type === "video"
                ? "▶"
                : "♪"}
            </span>
          ))}
        </motion.div>
        <p className="text-sm font-medium text-ink2 mb-1">
          {attachments.length} attachment{attachments.length !== 1 ? "s" : ""}{" "}
          ready
        </p>
        <p className="text-xs text-ink4 leading-relaxed">
          Tap send to search, or add a text description for better results
        </p>
      </div>
    );
  }

  // Filter trending based on query
  const filtered = query.trim()
    ? TRENDING_SEARCHES.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : TRENDING_SEARCHES;

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-24 md:pt-32 pb-40">
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
          {query.trim() ? "Suggestions" : "Trending"}
        </span>
      </div>

      <div className="v-card rounded-2xl overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((search, i) => (
            <motion.button
              key={search}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => {
                setQuery(search);
                performSearch();
              }}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-bg/60 transition-colors"
              style={{
                borderBottom:
                  i < filtered.length - 1
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
              <span className="text-sm text-ink2">{search}</span>
            </motion.button>
          ))
        ) : query.trim() ? (
          <button
            onClick={() => performSearch()}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-bg/60 transition-colors"
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
            <span className="text-sm text-ink2">
              Search for &ldquo;{query}&rdquo;
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
