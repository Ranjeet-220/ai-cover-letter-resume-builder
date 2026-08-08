import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "../components/Toast";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://jobbeam.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CoverCraft AI Studio - ATS Resume, Cover Letter & Executive CV Builder",
    template: "%s | CoverCraft AI Studio",
  },
  description: "Create personalized, ATS-optimized cover letters, Ivy League resumes, and executive CVs in seconds with Gemini 3.1 Flash Lite. Features 1-click job post URL extraction and real-time ATS match scoring.",
  keywords: [
    "AI Cover Letter Generator",
    "Cover Letter Builder",
    "Ivy League Resume Template",
    "AI Resume Tailoring",
    "Job Post URL Importer",
    "ATS Match Score Analyzer",
    "Gemini 3.1 Flash Lite Career Tools",
    "Executive CV Builder",
    "Job Application Assistant",
  ],
  authors: [{ name: "Ranjeet Munjewar", url: APP_URL }],
  creator: "CoverCraft AI",
  publisher: "CoverCraft AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "CoverCraft AI Studio - ATS Resume, Cover Letter & Executive CV Builder",
    description: "Create personalized, ATS-optimized cover letters, Ivy League resumes, and executive CVs in seconds with Gemini 3.1 Flash Lite.",
    url: APP_URL,
    siteName: "CoverCraft AI Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoverCraft AI Studio - Smart Career Writing Suite",
    description: "Create personalized, ATS-optimized cover letters, Ivy League resumes, and executive CVs in seconds with Gemini 3.1 Flash Lite.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-zinc-100 antialiased selection:bg-white selection:text-black font-sans min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
