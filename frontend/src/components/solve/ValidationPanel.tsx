"use client";

import { Fragment } from "react";
import ValidationContent from "./ValidationContent";

type ValidationPanelProps = {
  problemId: string;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  annotateErrors: (codeWithLines: string, error: any) => Promise<any>;
  onOpenTestAnimation: (
    name: string,
    testCase?: Record<string, any>
  ) => Promise<void>;
  timer: any;
};

export default function ValidationPanel({
  problemId,
  editorRef,
  monacoRef,
  annotateErrors,
  onOpenTestAnimation,
  timer,
}: ValidationPanelProps) {
  return (
    <Fragment>
      <ValidationContent
        timer={timer}
        problemId={problemId}
        editorRef={editorRef}
        monacoRef={monacoRef}
        annotateErrors={annotateErrors}
        onOpenTestAnimation={onOpenTestAnimation}
      />
    </Fragment>
  );
}
