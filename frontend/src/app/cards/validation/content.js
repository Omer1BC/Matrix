import { useState, useEffect, Fragment } from "react";
import "./validation.css";
import { ping } from "@/app/utils/apiUtils";
import StarGraph from "./StarGraph";

export default function ValidationContent({
  annotateError,
  problemID,
  editorRef,
}) {
  const [details, setDetails] = useState([]);
  const [activeTest, setActiveTest] = useState({});
  const [tests, setTests] = useState({});
  const [activeKey, setActiveKey] = useState(0);

  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [llmMetrics, setLLmMetrics] = useState(null);
  const [llmExplanations, setLLmExplanations] = useState({});
  const [llmComment, setLLmComment] = useState("");
  const [testSummary, setTestSummary] = useState(null);

  const fetchDetails = () => {
    ping({ problem_id: problemID }, "problem_details").then((data) => {
      if (editorRef.current) {
        editorRef.current.setValue(data.method_stub);
      }
      setDetails(data);
      try {
        const orig = data.tests;
        if (orig) {
          const fixedStr = orig.replace(/'/g, '"');
          const json = JSON.parse(fixedStr);
          console.log(json);
          setTests(json);
          setActiveTest(Object.values(json)[0]);
          setActiveKey(Object.keys(json)[0]);
        } else {
          setTests({});
          setActiveTest({});
          setActiveKey(0);
        }
      } catch {
        setTests({});
        setActiveTest({});
        setActiveKey(0);
      }
    });
  };

  useEffect(() => fetchDetails, [editorRef]);

  const test = async () => {
    setHasError(false);

    try {
      const code = editorRef.current?.getValue() || "";

      if (!code.trim()) {
        alert("Please add some code before running tests.");
        setHasError(true);
        return;
      }

      const data = { problem_id: problemID, code: code };
      const resp = await ping(data, "grade_solution");

      const { verdict, metrics, explanations, comment, test_summary } =
        resp || {};

      const cases = test_summary?.cases || {};
      setTests(cases);
      const firstKey = Object.keys(cases)[0] || 0;
      setActiveKey(firstKey);
      setActiveTest(cases[firstKey] || {});
      setTestSummary(test_summary || null);

      setLLmMetrics(metrics || null);
      setLLmExplanations(explanations || {});
      setLLmComment(comment || "");

      const allPassed =
        (test_summary?.total || 0) > 0 && (test_summary?.failed || 0) === 0;
      setShowVictoryModal(Boolean(verdict || allPassed));
    } catch {
      setHasError(true);
    }
  };

  const isPassed = (val) =>
    JSON.stringify(val?.actual) === JSON.stringify(val?.expected);

  return (
    <div className="validation-content">
      <div className="test-cases">
        {Object.entries(tests).map(([ky, val]) => (
          <button
            key={ky}
            className={`test-case ${activeKey === ky ? "active" : ""}`}
            onClick={() => {
              setActiveTest(val);
              setActiveKey(ky);
            }}
          >
            Test Case {ky}
            <span
              className={`circle ${
                JSON.stringify(val.actual) !== JSON.stringify(val.expected)
                  ? "failure"
                  : "success"
              }`}
            ></span>
          </button>
        ))}
        <div style={{ paddingBottom: "10px" }}></div>
        <button
          id="test-button"
          onClick={test}
          type="button"
          className="focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
          style={{
            backgroundColor: hasError ? "var(--failure-color)" : "var(--gr-2)",
            color: "var(--dbl-1)",
          }}
        >
          Test
        </button>
      </div>
      <div className="output">
        <div className="output-content">
          {Object.entries(activeTest).map(([key, val]) => (
            <Fragment key={key}>
              <div>{key}</div>
              <div className="test-output-value">{JSON.stringify(val)}</div>
            </Fragment>
          ))}
        </div>
      </div>

      {showVictoryModal && (
        <div
          className="victory-modal-overlay"
          onClick={() => setShowVictoryModal(false)}
        >
          <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="victory-content">
              <h2>🎉 Results</h2>
              {testSummary && (
                <p>
                  Passed {testSummary.passed}/{testSummary.total} tests
                  {testSummary.failed ? `, ${testSummary.failed} failed` : ""}.
                </p>
              )}

              {/* Star Graph with dynamic metrics */}
              <div className="metrics-container">
                <StarGraph
                  metrics={
                    llmMetrics || {
                      robustness: 0,
                      efficiency: 0,
                      readability: 0,
                    }
                  }
                  explanations={
                    llmExplanations || {
                      robustness: "",
                      efficiency: "",
                      readability: "",
                    }
                  }
                />
              </div>

              {/* Explanations */}
              {/* {llmExplanations && Object.keys(llmExplanations).length > 0 && (
                <div className="metrics-explanations">
                  <h4>Feedback</h4>
                  <ul>
                    {Object.entries(llmExplanations).map(([k, v]) => (
                      <li key={k}>
                        <strong style={{ textTransform: "capitalize" }}>
                          {k}:
                        </strong>{" "}
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}

              {llmComment && <p style={{ marginTop: 8 }}>{llmComment}</p>}

              <button
                className="victory-close-btn"
                onClick={() => setShowVictoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
