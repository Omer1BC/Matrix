"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

type Props = {
  notes: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

export function NotesCard({ notes, onChange, onBlur }: Props) {
  return (
    <Card className="flex flex-col h-full bg-card/40 p-6 overflow-hidden">
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Here you can take some notes"
        className="w-full flex-1 min-h-0 resize-none overflow-y-auto border-primary/30 bg-input text-[rgb(102,255,102)] placeholder:text-[rgb(102,255,102)] rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-[rgb(102,255,102)] focus:border-[rgb(102,255,102)]"
      />
    </Card>
  );
}