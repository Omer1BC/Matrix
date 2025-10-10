"use client";

import "../templates.css";
import { Editor } from "@monaco-editor/react";
import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  Fragment,
  useContext,
} from "react";
import Card from "../templates/card/card";
import ValidationContent from "../cards/validation/content";
import { ReferencesContent, Tools } from "../cards/references/content";
import { patternToTabs } from "../patterns/mappings";
import { ping, agentCall } from "../utils/apiUtils";
import { QuestionContent } from "../cards/content/content";
import { UserContext } from "../contexts/usercontext";

export default function Home({ id }) {
  //defines an annotation div
  const HoverWidgetCtor = useMemo(() => {
    return class HoverWidget {
      constructor(editor, monaco, message, type, replaceByDecoId) {
        this._editor = editor;
        this._monaco = monaco;
        this._message = message;
        this._type = type;
        this._replaceByDecoId = replaceByDecoId;

        this._domNode = document.createElement("div");
        this._domNode.className = "my-hover-widget";

        const button = document.createElement("button");
        button.className = "my-hover-widget-button";
        button.textContent = "✔";
        button.onclick = () =>
          this._decorationId &&
          this._replaceByDecoId(this._decorationId, this._type, this._message);

        const buttonSection = document.createElement("div");
        buttonSection.className = "my-hover-widget-button-section";
        buttonSection.appendChild(button);

        const messageSection = document.createElement("div");
        messageSection.className = "my-hover-widget-message";
        messageSection.textContent = message;

        this._domNode.appendChild(buttonSection);
        this._domNode.appendChild(messageSection);

        this._id = `hover.widget-${hoverIdSeq.current++}`; // unique id
        this._position = null;
        this._decorationId = null;
      }

      setDecorationId(id) {
        this._decorationId = id;
      }
      getId() {
        return this._id;
      }
      getDomNode() {
        return this._domNode;
      }
      getPosition() {
        if (!this._position) return null;
        return {
          position: this._position,
          preference: [
            this._monaco.editor.ContentWidgetPositionPreference.ABOVE,
            this._monaco.editor.ContentWidgetPositionPreference.BELOW,
          ],
        };
      }
      showAt(position) {
        this._position = position;
        this._editor.layoutContentWidget(this);
      }
      hide() {
        this._position = null;
        this._editor.layoutContentWidget(this);
      }
    };
  }, []);
  /*States */
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const [textHighlights, setTextHighlights] = useState("");
  const [output, setOutput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({});

  const hintWidgetByDeco = useRef(new Map());
  const errorWidgetByDeco = useRef(new Map());
  const hoverIdSeq = useRef(1);

  const [showHints, setShowHints] = useState(true);
  const showHintsRef = useRef(true);

  const [showTimer, setShowTimer] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timeRef = useRef(null);

  const startTimer = useCallback(() => {
    setShowTimer(true);
    console.log("Timer started");
    if (!timeRef.current) {
      timeRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
  }, []);
  
  const stopTimer = useCallback(() => {
    setShowTimer(false);
    console.log("Timer stopped");
    clearInterval(timeRef.current);
    timeRef.current = null;
  }, []);

  const restartTimer = useCallback(() => {
    setShowTimer(false)
    clearInterval(timeRef.current);
    timeRef.current = null;
    setSeconds(0);
  }, []);

  const [toolsInfo, setToolsInfo] = useState([]);
  const addToolsTab = (tools) => setToolsInfo(tools);

  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    showHintsRef.current = showHints;
  }, [showHints]);

  /*Init Problem Info */
  useEffect(() => {
    ping({ problem_id: 1 }, "problem_details").then((data) => {
      if (editorRef.current) {
        editorRef.current.setValue(data.method_stub);
      }
      setDetails(data);
    });
  }, []);

  useEffect(() => {
    const tools = Object.entries(details?.tools ? details?.tools : {}).map(
      ([name, info]) => ({
        name: name,
        description: info?.description,
        code: info?.code,
      })
    );
    addToolsTab(tools);

    addQuestionTab(details?.title, details?.difficulty, details?.description);
  }, [details]);

  /*Methods*/
  //Hight to ask
  function handleMouseUp() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setLoading(true);
      // ping(
      //   {
      //     text: selection.toString(),
      //     question: details?.title + "\n" + details?.description,
      //   },
      //   "ask"
      // )
      agentCall({
        user_id: user,
        problem_id: String(details?.id || 1),
        intent: "chat",
        message: selection.toString(),
        question: details?.title + "\n" + details?.description,
      })
        .then((res) => {
          setResponse(res?.data?.text ?? res?.data?.response ?? "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
      console.log("Selected text:", selection.toString());
    }
  }

  const replaceByDecorationId = useCallback((decorationId, type, code) => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    const rangeObj = model.getDecorationRange(decorationId);
    if (!rangeObj) return; // already gone

    if (type === 0) {
      const ln = rangeObj.startLineNumber;
      const range = new monacoRef.current.Range(
        ln,
        1,
        ln,
        model.getLineMaxColumn(ln)
      );
      editor.executeEdits("", [{ range, text: code }]);
    }

    editor.deltaDecorations([decorationId], []);

    const map =
      type === 0 ? errorWidgetByDeco.current : hintWidgetByDeco.current;
    const w = map.get(decorationId);
    if (w) {
      editor.removeContentWidget(w);
      map.delete(decorationId);
    }
  }, []);

  //Anotate the code editor

  const annotate = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) {
      alert("Please wait for the editor to load and try again!");
      return;
    }

    const model = editor.getModel();
    const n = model.getLineCount();
    let code = "";
    //Send the current code line-numbered
    for (let i = 1; i <= n; i++) {
      code += `${i} | ${model.getLineContent(i)}\n`;
    }
    //Ping the endpoint with the code /backend/api/views.py: annotate()
    setLoading(true);
    // ping({ code: code, tests: {} }, "annotate")
    agentCall({
      user_id: user,
      problem_id: String(details?.id || 1),
      intent: "annotated_hints",
      code: code,
    })
      .then((res) => {
        const data = res?.data || {};
        const resp = data.line_number_to_comment;
        setResponse(data.expalantions_of_hint || "");
        setLoading(false);

        //Generate a new set of highlights for each annotation
        const prevIds = Array.from(hintWidgetByDeco.current.keys());
        const decorations = Object.keys(resp).map((line) => ({
          range: new monaco.Range(Number(line), 1, Number(line), 1),
          options: {
            isWholeLine: true,
            className: "highlight",
          },
        }));

        const newIds = editor.deltaDecorations(prevIds, decorations);

        hintWidgetByDeco.current.forEach((w) => editor.removeContentWidget(w));
        hintWidgetByDeco.current.clear();

        newIds.forEach((decoId, idx) => {
          const [, message] = Object.entries(resp)[idx];
          const w = new HoverWidgetCtor(
            editor,
            monaco,
            message,
            1,
            replaceByDecorationId
          );
          w.setDecorationId(decoId);
          hintWidgetByDeco.current.set(decoId, w);
          editor.addContentWidget(w);
        });
      })
      .catch(() => setLoading(false));
  }, [HoverWidgetCtor, replaceByDecorationId]);

  const annotateError = (codeError) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) {
      alert("Please wait for the editor to load and try again!");
      return;
    }

    const model = editor.getModel();
    const n = model.getLineCount();
    let code = "";
    for (let i = 1; i <= n; i++) {
      code += `${i} | ${model.getLineContent(i)}\n`;
    }

    setLoading(true);
    // ping({ code: code, error: codeError, id: 1 }, "annotate_errors")
    agentCall({
      user_id: user,
      problem_id: String(details?.id || 1),
      intent: "annotate_errors",
      code: code,
      extras: {
        error:
          typeof codeError === "string" ? codeError : JSON.stringify(codeError),
      },
    })
      .then((res) => {
        const data = res?.data || {};
        const resp = data.line_number_to_replacement || {};
        setResponse(data.expalantions_of_hint || "");
        setLoading(false);

        const prevIds = Array.from(errorWidgetByDeco.current.keys());
        const decorations = Object.keys(resp).map((line) => ({
          range: new monaco.Range(Number(line), 1, Number(line), 1),
          options: { isWholeLine: true, className: "error-highlight" },
        }));

        const newIds = editor.deltaDecorations(prevIds, decorations);

        errorWidgetByDeco.current.forEach((w) => editor.removeContentWidget(w));
        errorWidgetByDeco.current.clear();

        newIds.forEach((decoId, idx) => {
          const [, message] = Object.entries(resp)[idx];
          const w = new HoverWidgetCtor(
            editor,
            monaco,
            message,
            0,
            replaceByDecorationId
          );
          w.setDecorationId(decoId);
          errorWidgetByDeco.current.set(decoId, w);
          editor.addContentWidget(w);
        });
      })
      .catch(() => setLoading(false));
  };

  function nextThread(input) {
    const problemQuestion = details?.title + "\n" + details?.description;
    const code = editorRef.current ? editorRef.current.getValue() : "";
    setLoading(true);
    // ping(
    //   {
    //     ask: input,
    //     code: code,
    //     question: problemQuestion,
    //   },
    //   "next_thread"
    // )
    agentCall({
      user_id: user,
      problem_id: String(details?.id || 1),
      intent: "chat",
      message: input,
      code: code,
      question: problemQuestion,
    })
      .then((res) => {
        setResponse(res?.data?.text ?? res?.data?.response ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }
  //When editor is loaded
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onMouseMove((e) => {
      if (!showHintsRef.current) return;

      const position = e.target.position;
      if (!position) return;

      const n = position.lineNumber;
      const model = editor.getModel();

      const showOrHide = (map) => {
        map.forEach((w, decoId) => {
          const range = model.getDecorationRange(decoId);
          if (range && range.startLineNumber === n) w.showAt(position);
          else w.hide();
        });
      };

      showOrHide(hintWidgetByDeco.current);
      showOrHide(errorWidgetByDeco.current);
    });
  }

  const addQuestionTab = (title, difficulty, description) => {
    setContentTabs((prev) => ({
      ...prev,
      question: {
        label: "Question",
        content: (
          <>
            <QuestionContent
              title={title}
              difficulty={difficulty}
              description={description}
              handleMouseUp={handleMouseUp}
            />
          </>
        ),
      },
    }));
  };

  const addToolAnimation = useCallback((link) => {
    setContentTabs((prev) => ({
      ...prev,
      custom: {
        label: `Custom Animation`,
        content: () => (
          <patternToTabs.arrays.video url={link.length > 0 ? link : null} />
        ),
      },
    }));
  }, []);

  //When user presses the + button on a tool pill
  const addToolCode = useCallback((code) => {
    if (!editorRef.current) return;
    editorRef.current.setValue(
      "'''\n" + code + "\n''''\n" + editorRef.current.getValue()
    );
  }, []);
  //When user presses the ? button on a tool pill
  const askAboutTool = useCallback(
    (pattern) => {
      if (!editorRef.current) return;
      setLoading(true);
      // ping({ code: editorRef.current.getValue(), pattern }, "tool_hints")
      agentCall({
        user_id: user,
        problem_id: String(details?.id || 1),
        intent: "tool_hints",
        code: editorRef.current.getValue(),
        extras: { pattern },
      })
        .then((res) => {
          const data = res?.data || {};
          setResponse(data.explanation || "");
          if (data.updatedCode) editorRef.current.setValue(data.updatedCode);
          setLoading(false);
        })
        .catch(() => setLoading(false));

      setValidationTabs((prev) => ({
        ...prev,
        custom: {
          label: `Custom Test`,
          content: () => (
            <patternToTabs.arrays.test
              args={details?.tools?.[pattern]?.args}
              addToolAnimation={addToolAnimation}
              name={pattern}
            />
          ),
        },
      }));
    },
    [addToolAnimation, details?.tools]
  );

  const hint = () => {
    if (editorRef.current) {
      setLoading(true);
      // ping({ code: editorRef.current.getValue(), tests: "" }, "hints")
      agentCall({
        user_id: user,
        problem_id: String(details?.id || 1),
        intent: "hints",
        code: editorRef.current.getValue(),
      })
        .then((res) => {
          const data = res?.data || {};
          setResponse(data.expalantions_of_hint || "");
          const annotated = data.annotated_code || "";
          const thought =
            data.thought_provoking_test_case_to_consider_as_comment_block || "";
          if (annotated || thought) {
            editorRef.current.setValue(
              [annotated, thought].filter(Boolean).join("\n\n")
            );
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  const clearHints = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const hintIds = Array.from(hintWidgetByDeco.current.keys());
    if (hintIds.length) editor.deltaDecorations(hintIds, []);
    hintWidgetByDeco.current.forEach((w) => editor.removeContentWidget(w));
    hintWidgetByDeco.current.clear();

    const errIds = Array.from(errorWidgetByDeco.current.keys());
    if (errIds.length) editor.deltaDecorations(errIds, []);
    errorWidgetByDeco.current.forEach((w) => editor.removeContentWidget(w));
    errorWidgetByDeco.current.clear();
  }, []);

  const [validationTabs, setValidationTabs] = useState({
    test: {
      label: "Tests",
      content: (
        <Fragment>
          <ValidationContent
            annotateError={annotateError}
            editorRef={editorRef}
            problemID={1}
            output={output}
          />
        </Fragment>
      ),
    },
  });
  const codeTabs = useMemo(
    () => ({
      editor: {
        label: "Editor",
        content: (
          <div
            className={`editor-container ${showHints ? "" : "hints-off"}`}
            style={{ borderRadius: ".5rem", position: "relative" }}
          >
            <Editor
              language="python"
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
              }}
              defaultValue={
                "def countComponents(n: int, edges: List[List[int]]) -> int:\n\treturn 0"
              }
            />
            <button
              className="editor-run-button"
              title="AI Hint"
              onClick={() => annotate()}
            >
              <img src="ai.png" alt="AI" />
            </button>
            <div className="editor-toggle">
              <button
                className="editor-toggle-hints"
                title="Toggle hints"
                onClick={() => setShowHints((v) => !v)}
              >
                {showHints ? "Hide Hints" : "Show Hints"}
              </button>
              <button
                className="editor-clear-hints"
                title="Clear all hints"
                onClick={clearHints}
              >
                Clear Hints
              </button>
              {
                showTimer ? (
                  <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <button className="editor-clear-hints" style={{cursor: "pointer"}} onClick={stopTimer}>Stop Timer</button>
                    <button className="editor-clear-hints" style={{cursor: "pointer"}} onClick={restartTimer}>Restart Timer</button>
                    <p className="editor-clear-hints">Time: {seconds} seconds</p>
                  </div>
                ) : (
                  <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <button className="editor-clear-hints" style={{cursor: "pointer"}} onClick={startTimer}>Start Timer</button>
                    <button className="editor-clear-hints" style={{cursor: "pointer"}} onClick={restartTimer}>Restart Timer</button>
                    <span className="editor-clear-hints">Time: {seconds} seconds</span>
                  </div>
                )
              }
            </div>
          </div>
        ),
      },
      tools: {
        label: "Tools",
        content: (
          <Tools
            tools={toolsInfo}
            addToolCode={addToolCode}
            askAboutTool={askAboutTool}
          />
        ),
      },
    }),
    [showHints, annotate, toolsInfo, addToolCode, askAboutTool, clearHints, showTimer, startTimer, stopTimer, seconds, restartTimer]
  );
  const [contentTabs, setContentTabs] = useState({
    question: {
      label: "Question",
      content: <QuestionContent handleMouseUp={handleMouseUp} />,
    },
  });

  const references = {
    ai: {
      label: (
        <div className="ai-tab-label">
          <img src="ai.png" className="ai-tab-icon" />
          Neo
        </div>
      ),
      content: (
        <Fragment>
          <ReferencesContent
            viewHint={annotate}
            response={response}
            loading={loading}
            nextThread={nextThread}
          />
        </Fragment>
      ),
    },
  };

  return (
    <>
      <div className="page">
        <div className="main">
          <Card className="content" tabs={contentTabs} />
          <Card className="references" tabs={references} />
          <Card className="code" tabs={codeTabs} />
          <Card className="validation" tabs={validationTabs} />
        </div>
      </div>
    </>
  );
}
