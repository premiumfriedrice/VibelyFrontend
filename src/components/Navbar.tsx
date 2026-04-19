"use client";

import { motion } from "framer-motion";
import { useVibely } from "@/lib/store";

export default function Navbar() {
  const { appState, showHistory, setShowHistory, resetSearch } = useVibely();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 md:px-8"
      style={{
        background: "linear-gradient(to bottom, var(--bg) 60%, transparent)",
      }}
    >
      {/* Menu button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-bg2"
        aria-label="Toggle history menu"
      >
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <rect y="0" width="20" height="2" rx="1" fill="var(--ink2)" />
          <rect y="6" width="14" height="2" rx="1" fill="var(--ink2)" />
          <rect y="12" width="18" height="2" rx="1" fill="var(--ink2)" />
        </svg>
      </button>

      {/* Logo */}
      <button
        onClick={resetSearch}
        className="relative group"
      >
        <span
          className="text-xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          Vibely
        </span>
        <motion.span
          className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </button>

      {/* Close button — only in results state */}
      {appState === "results" ? (
        <button
          onClick={resetSearch}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-bg2"
          aria-label="Close results"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1L13 13M13 1L1 13"
              stroke="var(--ink3)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : (
        <div className="w-10" />
      )}
    </motion.nav>
  );
}
