"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import React from "react";
import { useEffect } from "react";

type Props = {
  notes: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function NotesCard({ notes, onChange, onBlur }: Props) {
  return (
    <>
      <Card className="bg-card/40 p-6 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              onBlur={onBlur}
              placeholder="Here you can take some notes"
              className="w-full h-70 border-primary/30 bg-input text-foreground placeholder:text-primary/30 focus:border-primary focus:ring-primary/20 resize-none overflow-auto"
            />
          </div>
        </div>
      </Card>
    </>
  );
}
