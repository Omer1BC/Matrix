"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createTour } from "../lib/tour";
import { getSeenStatus } from "@/lib/supabase/auth";

export const useGlobalTour = () => {
  const pathname = usePathname();

  useEffect(() => {
    const runTour = async () => {
      const seen = await getSeenStatus();
      console.log(seen);
      const tour = await createTour(pathname, seen); // async version
      if (tour != null && tour.steps.length > 0) tour.start();
    };

    runTour();

    return () => {
      // optional: cancel tour if createTour hasn’t finished
    };
  }, [pathname]);
};