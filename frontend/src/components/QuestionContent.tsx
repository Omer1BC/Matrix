"use client";
import { Difficulty } from "@/lib/types";

type QuestionContentProps = {
  title?: string;
  difficulty?: Difficulty;
  description?: string;
  handleMouseUp?: () => void;
};

const DIFFICULTY_TO_ACTIVE = (d?: string) => {
  const v = (d || "").toLowerCase();
  if (v === "easy") return 1;
  if (v === "medium") return 2;
  if (v === "hard") return 3;
  return 0;
};

export function QuestionContent({
  title,
  difficulty,
  description,
  handleMouseUp,
}: QuestionContentProps) {
  const activeBars = DIFFICULTY_TO_ACTIVE(difficulty);

  return (
    <div
      onMouseUp={handleMouseUp}
      className="flex h-full flex-col rounded-md p-5 gap-5 font-sans"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[26px] font-semibold text-[var(--gr-2)]">
            {title}
          </p>

          <div className="flex items-end gap-1 rounded bg-[var(--dbl-4)] px-3 py-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={[
                  "w-2 rounded-sm",
                  n === 1 ? "h-4" : n === 2 ? "h-5" : "h-6",
                  n <= activeBars ? "bg-[#ff9e27]" : "bg-[rgba(255,165,0,0.2)]",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--dbl-2)] px-5 py-4">
        <p className="m-0 text-[17.6px] leading-6 text-[var(--gr-2)]">
          {description}
        </p>
      </div>
    </div>
  );
}
