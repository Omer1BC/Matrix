"use client";

import { Difficulty } from "@/lib/types/types";
import { QuestionContent } from "./QuestionContent";

type QuestionPanelProps = {
  title?: string;
  difficulty?: Difficulty;
  description?: string;
  onMouseUp: () => void;
};

export default function QuestionPanel({
  title,
  difficulty,
  description,
  onMouseUp,
}: QuestionPanelProps) {
  return (
    <div>
      <QuestionContent
        title={title}
        difficulty={difficulty}
        description={description}
        handleMouseUp={onMouseUp}
      />
    </div>
  );
}
