"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

type Props = {
  saving: boolean;
  disabled: boolean;
  onSave: () => void;
};

export function SaveBar({ saving, disabled, onSave }: Props) {
  return (
    <div className="flex justify-end">
      <Button
        onClick={onSave}
        disabled={disabled}
        size="default"
        variant="default"
        className="glow-text border-2 border-primary bg-primary font-mono text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(102,255,102,0.5)]"
      >
        <Save className="mr-2 h-4 w-4" />
        {saving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
