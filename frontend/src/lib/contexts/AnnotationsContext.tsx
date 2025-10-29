// lib/contexts/AnnotationsContext.tsx
"use client";
import { createContext, useContext } from "react";
import { useAnnotations } from "@/lib/hooks/useAnnotations";

type AnnotationsContext = ReturnType<typeof useAnnotations>;

const Ctx = createContext<AnnotationsContext | null>(null);

export function AnnotationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useAnnotations();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnnotationsContext() {
  const context = useContext(Ctx);
  if (!context)
    throw new Error(
      "useAnnotationsContext must be used within AnnotationsProvider"
    );
  return context;
}
