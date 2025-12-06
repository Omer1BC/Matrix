"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function SettingsHeader() {
  return (
    <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-mono text-sm">Back to Home</span>
        </Link>
        <h1 className="glow-text font-mono text-xl font-bold text-primary">
          Account Settings
        </h1>
        <div className="w-24" />
      </div>
    </header>
  );
}
