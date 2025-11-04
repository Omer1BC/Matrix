"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createTour } from "../lib/tour";

export const useGlobalTour = () => {
  const pathname = usePathname();

  useEffect(() => {
    const tour = createTour(pathname);
    if (tour.steps.length > 0) tour.start();

    return () => tour.cancel();
  }, [pathname]);
};