"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVibely } from "@/lib/store";
import { PLACEHOLDER_MESSAGES } from "@/lib/mock-data";

export default function SearchBar() {
  const {
    appState,
    query,
    setQuery,
    setAppState,
    attachments,
    removeAttachment,
    addAttachment,
    performSearch,
  } = useVibely();

  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIdx, setCharIdx] = useState(0);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Animated placeholder
  useEffect(() => {
    const target = PLACEHOLDER_MESSAGES[placeholderIdx];

    if (isTyping) {
      if (charIdx < target.length) {
        const timer = setTimeout(() => {
          setPlaceholder(target.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        }, 35);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsTyping(false), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      if (charIdx > 0) {
        const timer = setTimeout(() => {
          setPlaceholder(target.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_MESSAGES.length);
        setIsTyping(true);
      }
    }
  }, [charIdx, isTyping, placeholderIdx]);

  const handleFocus = () => {
    setIsFocused(true);
    if (appState === "empty") setAppState("typing");
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSubmit = useCallback(() => {
    if (!query.trim() && attachments.length === 0) return;
    performSearch();
    textareaRef.current?.blur();
  }, [query, attachments, performSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (type: "image" | "video" | "audio") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      type === "image"
        ? "image/*"
        : type === "video"
        ? "video/*"
        : "audio/*";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        addAttachment({
          id: crypto.randomUUID(),
          type,
          label: file.name,
          subtitle: `${(file.size / 1024).toFixed(0)}KB`,
          preview: type === "image" ? (reader.result as string) : undefined,
        });
      };
      reader.readAsDataURL(file);
    };

    input.click();
    setShowPlusMenu(false);
  };

  if (appState === "loading") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Gradient fade */}
      <div
        className="h-16 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--bg))",
        }}
      />

      <div className="bg-bg px-4 pb-5 md:px-8 md:pb-6">
        <div className="max-w-2xl mx-auto">
          {/* Attachment chips */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                {attachments.map((att) => (
                  <motion.div
                    key={att.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="v-card flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl"
                  >
                    {att.preview ? (
                      <img
                        src={att.preview}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{
                          background: "var(--bg2)",
                          color:
                            att.type === "video"
                              ? "var(--mode-video)"
                              : "var(--mode-audio)",
                        }}
                      >
                        {att.type === "video" ? "▶" : "♪"}
                      </div>
                    )}
                    <div className="pr-1">
                      <p className="text-xs font-medium text-ink2 truncate max-w-[100px]">
                        {att.label}
                      </p>
                      <p className="text-[10px] text-ink4">{att.subtitle}</p>
                    </div>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded-full hover:bg-bg2 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1 1l8 8M9 1l-8 8"
                          stroke="var(--ink4)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main input pill */}
          <div className={`v-pill rounded-[var(--r22)] ${isFocused ? "" : ""}`}>
            <div className="flex items-end gap-2 px-4 py-3">
              {/* Plus menu */}
              <div className="relative mb-0.5">
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                  style={{ background: "var(--bg2)" }}
                >
                  <motion.svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    animate={{ rotate: showPlusMenu ? 45 : 0 }}
                  >
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="var(--ink3)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-12 left-0 v-card rounded-xl p-1.5 min-w-[160px] shadow-lg"
                    >
                      {[
                        { label: "Upload image", icon: "🖼", type: "image" as const },
                        { label: "Upload video", icon: "▶", type: "video" as const },
                        { label: "Upload audio", icon: "♪", type: "audio" as const },
                      ].map((item) => (
                        <button
                          key={item.type}
                          onClick={() => handleFileUpload(item.type)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg transition-colors text-left"
                        >
                          <span className="text-sm">{item.icon}</span>
                          <span className="text-sm text-ink2">{item.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (appState === "empty" || appState === "results")
                      setAppState("typing");
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="w-full resize-none bg-transparent text-ink text-base leading-relaxed outline-none placeholder-transparent"
                  style={{
                    minHeight: "28px",
                    maxHeight: "112px",
                    fontFamily: "var(--font-body)",
                  }}
                />
                {!query && (
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    <span className="text-ink4 text-base">
                      {placeholder}
                      <span className="typing-cursor text-accent">|</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSubmit}
                disabled={!query.trim() && attachments.length === 0}
                className="flex items-center justify-center w-9 h-9 rounded-full mb-0.5 transition-all"
                style={{
                  background:
                    query.trim() || attachments.length > 0
                      ? "var(--accent)"
                      : "var(--bg2)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 8h12M10 4l4 4-4 4"
                    stroke={
                      query.trim() || attachments.length > 0
                        ? "white"
                        : "var(--ink4)"
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
