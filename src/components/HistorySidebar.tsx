"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useVibely } from "@/lib/store";
import { timeAgo } from "@/lib/types";

export default function HistorySidebar() {
  const {
    showHistory,
    setShowHistory,
    searchHistory,
    savedContent,
    loadHistoryItem,
    clearHistory,
    resetSearch,
  } = useVibely();

  return (
    <AnimatePresence>
      {showHistory && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={() => setShowHistory(false)}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
            style={{
              width: "min(82%, 340px)",
              background: "#E8E1D2",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <h2
                className="text-lg font-medium text-ink2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
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

            {/* Recent Searches */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <p className="px-2 py-2 text-xs font-medium uppercase tracking-wider text-ink4">
                Recent Searches
              </p>
              {searchHistory.length === 0 ? (
                <p className="px-2 py-4 text-sm text-ink4">No searches yet</p>
              ) : (
                <div className="space-y-1.5">
                  {searchHistory.map((item, i) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => loadHistoryItem(item)}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/40 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink2 truncate flex-1">
                          {item.query}
                        </p>
                        <span className="text-xs text-ink4 whitespace-nowrap mt-0.5">
                          {timeAgo(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-ink4 mt-0.5">
                        {item.results.length} result{item.results.length !== 1 ? "s" : ""}
                      </p>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Saved Content */}
              {savedContent.length > 0 && (
                <>
                  <p className="px-2 py-2 mt-4 text-xs font-medium uppercase tracking-wider text-ink4">
                    Saved
                  </p>
                  <div className="grid grid-cols-3 gap-2 px-1">
                    {savedContent.map((item) => (
                      <div
                        key={item.content_id}
                        className="aspect-[3/4] rounded-lg overflow-hidden bg-bg3"
                      >
                        <img
                          src={item.thumb}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-black/10 flex items-center justify-between">
              <button
                onClick={clearHistory}
                className="text-xs text-ink4 hover:text-ink2 transition-colors"
              >
                Clear history
              </button>
              <button
                onClick={() => {
                  setShowHistory(false);
                  resetSearch();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-colors"
                style={{ background: "var(--accent)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                New search
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
