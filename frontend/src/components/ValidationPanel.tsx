"use client";
import { Fragment } from "react";
import ValidationContent from "./ValidationContent";

type ValidationPanelProps = {
  annotateError: (err: string) => void;
  editorRef: React.RefObject<any>;
  problemId: number;
  //   output: string;
};

export default function ValidationPanel({
  annotateError,
  editorRef,
  problemId,
}: ValidationPanelProps) {
  return (
    <Fragment>
      <ValidationContent
        annotateError={annotateError}
        editorRef={editorRef}
        problemId={problemId}
      />
    </Fragment>
  );
}
