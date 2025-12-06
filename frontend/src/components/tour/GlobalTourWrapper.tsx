"use client";

import { ReactNode } from "react";
import { useGlobalTour } from "./GlobalTour";

export default function GlobalTourWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useGlobalTour();
  return <>{children}</>;
}
