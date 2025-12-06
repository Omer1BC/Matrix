"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createTour } from "./tour";
import { getSeenStatus } from "@/lib/supabase/auth";

export const useGlobalTour = () => {
  const pathname = usePathname();

  useEffect(() => {
    const runTour = async () => {
      const seen = await getSeenStatus();
      const tour = await createTour(pathname, seen); // async version
      if (tour != null && tour.steps.length > 0) tour.start();
    };

    runTour();

    return () => {};
  }, [pathname]);
};
