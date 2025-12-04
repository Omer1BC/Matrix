"use client";
import React from "react";

type AnimationPlayerProps = { url: string | null; autoPlay?: boolean };

export default function AnimationPlayer({
  url,
  autoPlay = true,
}: AnimationPlayerProps) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--gr-2)]">
        Couldn{"'"}t generate animation.
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <video
        key={url}
        src={url}
        autoPlay={autoPlay}
        controls={false}
        muted
        loop
        className="max-h-full max-w-full"
      />
    </div>
  );
}
