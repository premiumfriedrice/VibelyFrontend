export type Platform = "tiktok" | "instagram";

export type SearchMode = "text" | "image" | "video" | "audio";

export type AppState = "empty" | "typing" | "loading" | "results";

export interface ContentResult {
  content_id: string;
  platform: Platform;
  url: string;
  creator: string;
  caption: string;
  thumb: string;
  video_url: string;
  likes: number;
  views: number;
  comments: number;
  score: number;
}

export interface MediaAttachment {
  id: string;
  type: SearchMode;
  label: string;
  subtitle: string;
  preview?: string; // data URL or object URL
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  attachments: MediaAttachment[];
  results: ContentResult[];
  timestamp: Date;
}

export interface ProductResult {
  id: string;
  name: string;
  price: string;
  source: string;
  imageURL?: string;
  productURL?: string;
  groupName: string;
}

// Helpers
export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export function matchPercent(score: number): string {
  return Math.round(score * 100) + "% match";
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const SEARCH_MODE_CONFIG: Record<
  SearchMode,
  { icon: string; color: string; placeholder: string; label: string }
> = {
  text: { icon: "✎", color: "var(--mode-text)", placeholder: "Describe it...", label: "Text" },
  image: { icon: "🖼", color: "var(--mode-image)", placeholder: "Upload an image...", label: "Image" },
  video: { icon: "▶", color: "var(--mode-video)", placeholder: "Upload a video...", label: "Video" },
  audio: { icon: "♪", color: "var(--mode-audio)", placeholder: "Upload audio...", label: "Audio" },
};
