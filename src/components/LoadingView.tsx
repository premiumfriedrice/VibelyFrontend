"use client";

import { motion } from "framer-motion";
import { useVibely } from "@/lib/store";
import { LOADING_STEPS } from "@/lib/mock-data";

export default function LoadingView() {
  const { query, loadingStep } = useVibely();

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-6 pt-32 md:pt-40">
      {/* Spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-12 h-12 mb-8"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid var(--line)" }}
        />
        <svg
          className="absolute inset-0 w-12 h-12 spin-slow"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="41.4 97"
          />
        </svg>
      </motion.div>

      {/* Query display */}
      {query && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-ink2 text-base font-medium mb-10 truncate max-w-full"
        >
          &ldquo;{query}&rdquo;
        </motion.p>
      )}

      {/* Step indicators */}
      <div className="space-y-3 w-full max-w-xs">
        {LOADING_STEPS.map((step, i) => {
          const isComplete = loadingStep > i;
          const isActive = loadingStep === i;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Status icon */}
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      d="M2 7.5L5.5 11L12 3"
                      stroke="var(--ink3)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                ) : isActive ? (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      border: "1.5px solid var(--ink4)",
                      opacity: 0.4,
                    }}
                  />
                )}
              </div>

              {/* Step text */}
              <span
                className="text-sm transition-colors duration-300"
                style={{
                  color:
                    isComplete || isActive ? "var(--ink)" : "var(--ink4)",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
