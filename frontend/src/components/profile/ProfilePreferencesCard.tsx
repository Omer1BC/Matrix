"use client";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import React from "react";

type Props = {
  learningStyle: string;
  onChange: (value: string) => void;
};

export function ProfilePreferencesCard({ learningStyle, onChange }: Props) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Learning Preferences
        </h2>
        <p className="text-primary">
          Describe how you learn best so the AI can personalize your guidance
        </p>
      </div>

      <Card className="matrix-border bg-card/40 p-6 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <Label className="text-lg font-semibold text-foreground">
              Your Learning Style
            </Label>
          </div>

          <p className="text-sm text-primary/70">
            Tell us about your learning preferences, strengths, and how you like
            to approach problem-solving.
          </p>

          <div className="space-y-2">
            <Textarea
              id="learningPreferences"
              value={learningStyle}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              placeholder="Example: I'm a visual learner who prefers to see diagrams and flowcharts…"
              className="min-h-[200px] resize-y border-primary/30 bg-input text-foreground placeholder:text-primary/30 focus:border-primary focus:ring-primary/20"
            />
            <p className="text-xs text-primary/50">
              Be as detailed as you’d like. Include your preferred learning
              methods and what helps you most.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
