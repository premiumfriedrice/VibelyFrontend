import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibely — search short-form by vibe",
  description:
    "Describe what you remember — we'll find it. Search TikTok, Instagram, and more by vibe using text, images, video, or audio.",
  openGraph: {
    title: "Vibely — search short-form by vibe",
    description:
      "Describe what you remember — we'll find it. Multimodal search for short-form content.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full noise-overlay">{children}</body>
    </html>
  );
}
