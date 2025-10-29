"use client";
import { Fragment } from "react";
import ValidationContent from "./ValidationContent";

type ValidationPanelProps = {
  problemId: number;
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  annotateErrors: (codeWithLines: string, error: any) => Promise<any>;
  //   output: string;
};

export default function ValidationPanel({
  problemId,
  editorRef,
  monacoRef,
  annotateErrors,
}: ValidationPanelProps) {
  return (
    <Fragment>
      <ValidationContent
        problemId={problemId}
        editorRef={editorRef}
        monacoRef={monacoRef}
        annotateErrors={annotateErrors}
      />
    </Fragment>
  );
}
