"use client";
import { ReferencesContent } from "./ReferencesContent";

type ReferencesPanelProps = {
  loading: boolean;
  response: string;
  onNextThread: (input: string) => void;
  onViewHint: () => void;
};

export default function ReferencesPanel({
  loading,
  response,
  onNextThread,
  onViewHint,
}: ReferencesPanelProps) {
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <ReferencesContent
        viewHint={onViewHint}
        response={response}
        loading={loading}
        nextThread={onNextThread}
      />
    </div>
  );
}
