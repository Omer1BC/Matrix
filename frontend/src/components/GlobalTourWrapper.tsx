"use client";

import { ReactNode, useEffect } from "react";
import { useGlobalTour } from "./GlobalTour";

export default function GlobalTourWrapper({ children }: { children: ReactNode }) {
  useGlobalTour(); // runs only on client
  return <>{children}</>;
}