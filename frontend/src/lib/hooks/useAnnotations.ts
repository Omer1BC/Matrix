import { useMemo, useRef, useCallback } from "react";

export function useAnnotations() {
  const hintWidgetByDeco = useRef(new Map<string, any>());
  const errorWidgetByDeco = useRef(new Map<string, any>());
  const hoverIdSeq = useRef(1);

  const HoverWidgetCtor = useMemo(() => {
    return class HoverWidget {
      constructor(
        editor: any,
        monaco: any,
        message: string,
        type: 0 | 1,
        replaceByDecoId: any
      ) {
        (this as any)._editor = editor;
        (this as any)._monaco = monaco;
        (this as any)._message = message;
        (this as any)._type = type;
        (this as any)._replaceByDecoId = replaceByDecoId;

        (this as any)._domNode = document.createElement("div");

        const kind = type === 0 ? "is-error" : "is-hint";
        (
          this as any
        )._domNode.className = `monaco-hint-widget ${kind} pointer-events-auto z-50 flex flex-col min-w-[300px] max-w-[450px] rounded-lg border border-[color:var(--dbl-4)] bg-[color:var(--dbl-3)] text-[color:var(--gr-2)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] overflow-hidden`;
        const button = document.createElement("button");
        button.className =
          "inline-flex items-center justify-center rounded-[3px] bg-[color:var(--gr-2)] text-[color:var(--dbl-1)] text-[11px] font-semibold px-1.5 py-1 transition-all duration-200 hover:bg-[color:var(--gr-1)] hover:-translate-y-px hover:shadow-[0_2px_4px_rgba(0,0,0,0.2)]";
        button.textContent = "✔";
        button.onclick = () =>
          (this as any)._decorationId &&
          (this as any)._replaceByDecoId(
            (this as any)._decorationId,
            (this as any)._type,
            (this as any)._message
          );

        const buttonSection = document.createElement("div");
        buttonSection.className =
          "flex items-center justify-end bg-[color:var(--dbl-4)] px-2 py-2 border-b border-[color:var(--dbl-1)]";
        buttonSection.appendChild(button);

        const messageSection = document.createElement("div");
        messageSection.className =
          "font-mono text-[13px] leading-[1.4] text-[color:var(--gr-2)] px-4 py-3 whitespace-pre-wrap";
        messageSection.textContent = message;

        (this as any)._domNode.appendChild(buttonSection);
        (this as any)._domNode.appendChild(messageSection);

        (this as any)._id = `hover.widget-${hoverIdSeq.current++}`;
        (this as any)._position = null;
        (this as any)._decorationId = null;
      }
      setDecorationId(id: string) {
        (this as any)._decorationId = id;
      }
      getId() {
        return (this as any)._id;
      }
      getDomNode() {
        return (this as any)._domNode;
      }
      getPosition() {
        const pos = (this as any)._position;
        if (!pos) return null;
        const m = (this as any)._monaco;
        return {
          position: pos,
          preference: [
            m.editor.ContentWidgetPositionPreference.ABOVE,
            m.editor.ContentWidgetPositionPreference.BELOW,
          ],
        };
      }
      showAt(position: any) {
        (this as any)._position = position;
        (this as any)._editor.layoutContentWidget(this);
      }
      hide() {
        (this as any)._position = null;
        (this as any)._editor.layoutContentWidget(this);
      }
    };
  }, []);

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
    [HoverWidgetCtor]
  );

  const applyHints = useCallback(
    (editor: any, monaco: any, map: Record<string, string>) => {
      decorateFromMap(editor, monaco, map, hintWidgetByDeco, 1);
    },
    [decorateFromMap]
  );

  const applyErrors = useCallback(
    (editor: any, monaco: any, map: Record<string, string>) => {
      decorateFromMap(editor, monaco, map, errorWidgetByDeco, 0);
    },
    [decorateFromMap]
  );

  const clearAll = useCallback((editor: any) => {
    const clear = (map: Map<string, any>) => {
      const ids = Array.from(map.keys());
      if (ids.length) editor.deltaDecorations(ids, []);
      map.forEach((w) => editor.removeContentWidget(w));
      map.clear();
    };
    clear(hintWidgetByDeco.current);
    clear(errorWidgetByDeco.current);
  }, []);

  const hideAll = useCallback(() => {
    const hide = (map: Map<string, any>) => {
      map.forEach((w) => w?.hide?.());
    };
    hide(hintWidgetByDeco.current);
    hide(errorWidgetByDeco.current);
  }, []);

  return {
    applyHints,
    applyErrors,
    clearAll,
    hideAll,
    hintWidgetByDeco,
    errorWidgetByDeco,
  };
}
