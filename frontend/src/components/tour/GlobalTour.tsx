"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createTour } from "./tour";
import { getSeenStatus } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/contexts/AuthContext";

export const useGlobalTour = () => {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const tourRef = useRef<Awaited<ReturnType<typeof createTour>>>(null);
  const creatingTourForPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't run tour if auth is still loading or user is not authenticated
    if (loading || !user) {
      return;
    }

    // Skip if we're already creating a tour for THIS pathname
    if (creatingTourForPathRef.current === pathname) {
      return;
    }

    // Cancel any existing tour before starting a new one
    if (tourRef.current) {
      if (tourRef.current.isActive()) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    }

    // Mark that we're creating a tour for this pathname
    creatingTourForPathRef.current = pathname;

    const runTour = async () => {
      try {
        const seen = await getSeenStatus();
        const tour = await createTour(pathname, seen);

        // Only start the tour if we're still on the same pathname
        if (
          tour != null &&
          tour.steps.length > 0 &&
          creatingTourForPathRef.current === pathname
        ) {
          tourRef.current = tour;
          tour.start();
        }
      } finally {
        // Only clear the flag if we're still on the same pathname
        if (creatingTourForPathRef.current === pathname) {
          creatingTourForPathRef.current = null;
        }
      }
    };

    runTour();

    return () => {
      // Cancel active tour if it exists
      if (tourRef.current && tourRef.current.isActive()) {
        tourRef.current.cancel();
        tourRef.current = null;
      }

      // Clear the creation flag for this pathname
      if (creatingTourForPathRef.current === pathname) {
        creatingTourForPathRef.current = null;
      }
    };
  }, [pathname, user, loading]);
};
