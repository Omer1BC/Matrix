"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createTour } from "./tour";
import { getSeenStatus } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/contexts/AuthContext";

export const useGlobalTour = () => {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Don't run tour if auth is still loading or user is not authenticated
    if (loading || !user) return;

    const runTour = async () => {
      const seen = await getSeenStatus();
      const tour = await createTour(pathname, seen); // async version
      if (tour != null && tour.steps.length > 0) tour.start();
    };

    runTour();

    return () => {};
  }, [pathname, user, loading]);
};
