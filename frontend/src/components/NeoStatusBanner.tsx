"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { AlertCircle, X } from "lucide-react";
import { agentHealth, type AgentHealthStatus } from "@/lib/agent";
import { Button } from "./ui/button";

export function NeoStatusBanner() {
  const [healthStatus, setHealthStatus] = useState<AgentHealthStatus | null>(
    null
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchHealth = useCallback(async () => {
    const data = await agentHealth();
    setHealthStatus(data);
    setHasChecked(true);

    if (data?.is_healthy) {
      // If service is healthy again, reset dismiss state
      setIsDismissed(false);
      // Stop polling since service is back up
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, []);

  const startPolling = useCallback(() => {
    // Only start polling if not already polling
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(fetchHealth, 30000);
    }
  }, [fetchHealth]);

  useEffect(() => {
    // Only check health when a service error occurs
    const handleServiceError = () => {
      fetchHealth();
      // Start polling to detect when service comes back up
      startPolling();
    };

    window.addEventListener("neo-service-error", handleServiceError);

    return () => {
      window.removeEventListener("neo-service-error", handleServiceError);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchHealth, startPolling]);

  // Don't show banner if haven't checked yet, is healthy, or is dismissed
  if (!hasChecked || !healthStatus || healthStatus.is_healthy || isDismissed) {
    return null;
  }

  const getErrorMessage = () => {
    switch (healthStatus.error_type) {
      case "configuration_error":
        return "Neo is currently unavailable due to a configuration issue. A system administrator has been notified.";
      case "authentication_error":
        return "Neo is currently unavailable due to a service authentication issue. A system administrator has been notified.";
      case "rate_limit_error":
        return "Neo is temporarily unavailable due to high demand. Please try again in a few minutes.";
      case "openai_error":
        return "Neo is experiencing technical difficulties. The issue has been reported to the system administrator.";
      default:
        return "Neo is currently unavailable. Please try again later or contact support.";
    }
  };

  const getBackgroundColor = () => {
    switch (healthStatus.error_type) {
      case "configuration_error":
        return "bg-red-600";
      case "authentication_error":
        return "bg-red-600";
      case "rate_limit_error":
        return "bg-yellow-600";
      default:
        return "bg-orange-600";
    }
  };

  return (
    <div
      className={`${getBackgroundColor()} text-white px-4 py-3 shadow-lg relative`}
      role="alert"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Neo Service Status</p>
            <p className="text-sm opacity-90">{getErrorMessage()}</p>
          </div>
        </div>

        <Button
          onClick={() => setIsDismissed(true)}
          className="ml-4 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss notification"
          variant={"destructive"}
          size={"undefined"}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
