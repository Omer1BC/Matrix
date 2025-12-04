
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "../lib/contexts/AuthContext";
import React from "react";
import Header from "@/components/Header";
import type { Metadata } from "next";
import GlobalTourWrapper from "../components/GlobalTourWrapper";
import { NeoStatusBanner } from "@/components/NeoStatusBanner";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Matrix",
  description: "Solve Leetcode Style Problems with the assistance of AI",
  icons: {
    icon: "/matrix_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`h-dvh flex flex-col ${geistSans.variable} ${geistMono.variable}`}
      >
        <AuthProvider>
          <GlobalTourWrapper>
            <Header />
            <NeoStatusBanner />
            {children}
          </GlobalTourWrapper>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
