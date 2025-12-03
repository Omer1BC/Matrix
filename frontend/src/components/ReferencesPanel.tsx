"use client";
import { ReferencesContent } from "./ReferencesContent";

type ReferencesPanelProps = {
  loading: boolean;
  response: string;
  onNextThread: (input: string) => void;
};

export default function ReferencesPanel({
  loading,
  response,
  onNextThread,
}: ReferencesPanelProps) {
  return (
    <div className="flex flex-col h-full w-full min-h-0">
      <ReferencesContent
        response={response}
        loading={loading}
        nextThread={onNextThread}
      />
    </div>
  );
}
