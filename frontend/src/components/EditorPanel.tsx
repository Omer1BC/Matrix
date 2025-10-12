"use client";
import { Editor } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";
import { useTimer } from "@/lib/hooks/useTimer";
import { useEditorHints } from "@/lib/hooks/useEditorHints";
import { injectMonacoDecorationStyles } from "@/lib/utils/utils";
import EditorUtilities from "./EditorUtilities";

type EditorPanelProps = {
  editorRef: React.RefObject<any>;
  monacoRef: React.RefObject<any>;
  showHints: boolean;
  setShowHints: (b: boolean) => void;
  onAnnotate: (codeWithLines: string) => Promise<any>;
  onAnnotateError: (codeWithLines: string, err: string) => Promise<any>;
  onMountExtras?: (editor: any, monaco: any) => void;
};

export default function EditorPanel({
  editorRef,
  monacoRef,
  showHints,
  setShowHints,
  onAnnotate,
  onAnnotateError,
  onMountExtras,
}: EditorPanelProps) {
  const { seconds, running, start, stop, reset } = useTimer();
  const {
    HoverWidgetCtor,
    hintWidgetByDeco,
    errorWidgetByDeco,
    clearAll,
    hideAll,
  } = useEditorHints();
  const showHintsRef = useRef<boolean>(showHints);
  const mouseMoveDisposableRef = useRef<any>(null);

  useEffect(() => {
    showHintsRef.current = showHints;
    const editor = editorRef.current;
    if (!editor) return;
    if (!showHints) {
      if (mouseMoveDisposableRef.current) {
        mouseMoveDisposableRef.current.dispose();
        mouseMoveDisposableRef.current = null;
      }
      hideAll();
    } else if (!mouseMoveDisposableRef.current) {
      mouseMoveDisposableRef.current = editor.onMouseMove((e: any) => {
        if (!showHintsRef.current) return;
        const position = e.target.position;
        if (!position) return;
        const model = editor.getModel();
        const showOrHide = (map: Map<string, any>) => {
          map.forEach((w: any, decoId: string) => {
            const range = model?.getDecorationRange(decoId);
            if (range && range.startLineNumber === position.lineNumber)
              w.showAt(position);
            else w.hide();
          });
        };
        showOrHide(hintWidgetByDeco.current);
        showOrHide(errorWidgetByDeco.current);
      });
    }
  }, [showHints, editorRef, hintWidgetByDeco, errorWidgetByDeco, hideAll]);

  const decorateFromMap = useCallback(
    (
      editor: any,
      monaco: any,
      lineToMessage: Record<string, string>,
      mapRef: React.RefObject<Map<string, any>>,
      type: 0 | 1
    ) => {
      const prevIds = Array.from(mapRef.current.keys());
      const decorations = Object.keys(lineToMessage).map((line) => ({
        range: new monaco.Range(Number(line), 1, Number(line), 1),
        options: {
          isWholeLine: true,
          className: type === 1 ? "monaco-hint-line" : "monaco-error-line",
        },
      }));
      const newIds = editor.deltaDecorations(prevIds, decorations);
      mapRef.current.forEach((w) => editor.removeContentWidget(w));
      mapRef.current.clear();
      newIds.forEach((decoId: string, idx: number) => {
        const [, message] = Object.entries(lineToMessage)[idx];
        const w = new (HoverWidgetCtor as any)(
          editor,
          monaco,
          message as string,
          type,
          (decorationId: string, t: 0 | 1, code: string) => {
            const model = editor.getModel();
            const rangeObj = model.getDecorationRange(decorationId);
            if (rangeObj && t === 0) {
              const ln = rangeObj.startLineNumber;
              const range = new monaco.Range(
                ln,
                1,
                ln,
                model.getLineMaxColumn(ln)
              );
              editor.executeEdits("", [{ range, text: code }]);
            }
            editor.deltaDecorations([decorationId], []);
            const map =
              t === 0 ? errorWidgetByDeco.current : hintWidgetByDeco.current;
            const ww = map.get(decorationId);
            if (ww) {
              editor.removeContentWidget(ww);
              map.delete(decorationId);
            }
          }
        );
        w.setDecorationId(decoId);
        mapRef.current.set(decoId, w);
        editor.addContentWidget(w);
      });
    },
    [HoverWidgetCtor, errorWidgetByDeco, hintWidgetByDeco]
  );

  const handleAnnotate = useCallback(async () => {
    if (!showHintsRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    const n = model.getLineCount();
    let code = "";
    for (let i = 1; i <= n; i++) code += `${i} | ${model.getLineContent(i)}\n`;

    const data = await onAnnotate(code);
    if (!showHintsRef.current) return;
    const lineToMessage = data?.line_number_to_comment ?? {};
    if (!Object.keys(lineToMessage).length) return;
    decorateFromMap(editor, monaco, lineToMessage, hintWidgetByDeco, 1);
  }, [decorateFromMap, editorRef, monacoRef, onAnnotate, hintWidgetByDeco]);

  return (
    <div
      className={`flex flex-col relative w-full min-h-0 ${
        showHints ? "" : "hints-off"
      }`}
      style={{ borderRadius: ".5rem", position: "relative" }}
    >
      <Editor
        language="python"
        theme="vs-dark"
        onMount={(editor, monaco) => {
          injectMonacoDecorationStyles();
          editorRef.current = editor;
          monacoRef.current = monaco;

          editor.onMouseMove((e: any) => {
            if (!showHints) return;
            const position = e.target.position;
            if (!position) return;
            const model = editor.getModel();
            const showOrHide = (map: Map<string, any>) => {
              map.forEach((w: any, decoId: string) => {
                const range = model?.getDecorationRange(decoId);
                if (range && range.startLineNumber === position.lineNumber)
                  w.showAt(position);
                else w.hide();
              });
            };
            showOrHide(hintWidgetByDeco.current);
            showOrHide(errorWidgetByDeco.current);
          });

          onMountExtras?.(editor, monaco);
        }}
        options={{ minimap: { enabled: false } }}
        defaultValue={
          "def countComponents(n: int, edges: List[List[int]]) -> int:\n\treturn 0"
        }
      />

      <EditorUtilities
        onAnnotate={handleAnnotate}
        showHints={showHints}
        setShowHints={setShowHints}
        clearHints={() => editorRef.current && clearAll(editorRef.current)}
        timer={{ running, seconds, start, stop, reset }}
      />
    </div>
  );
}
