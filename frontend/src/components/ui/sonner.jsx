"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group',
          error: '!bg-destructive !text-destructive-foreground !border-destructive',
          success: '!bg-primary !text-primary-foreground !border-primary',
          warning: '!bg-yellow-600 !text-white !border-yellow-600',
          info: '!bg-blue-600 !text-white !border-blue-600',
        },
      }}
      {...props} />
  );
}

export { Toaster }
