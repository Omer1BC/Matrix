"use client";
import { useTimer } from "@/lib/hooks/useTimer";

import { Fragment } from "react";
import ValidationContent from "./ValidationContent";

type ValidationPanelProps = {
  problemId: string;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  annotateErrors: (codeWithLines: string, error: any) => Promise<any>;
  timer: any;
  //   output: string;
};

export default function ValidationPanel({
  problemId,
  editorRef,
  monacoRef,
  annotateErrors,
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
      />
    </Fragment>
  );
}
