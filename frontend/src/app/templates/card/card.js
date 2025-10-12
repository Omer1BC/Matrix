import { useRef, useState, useEffect } from "react";
import "./card.css";

export default function Card({ tabs, className }) {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);
  return (
    <>
      <div className={className}>
        <div id="header" className="">
          <div className="tab-list" role="tablist">
            {Object.keys(tabs).map((key) => {
              const tab = tabs[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`tab-button ${activeTab === key ? "active" : ""}`}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div id="body">
          {/* {content} */}
          {Object.keys(tabs).map((key) => (
            <TabPanel key={key} active={activeTab === key}>
              {typeof tabs[key].content === "function"
                ? tabs[key].content()
                : tabs[key].content}
            </TabPanel>
          ))}
        </div>
      </div>
    </>
  );
}

function TabPanel({ active, children }) {
  return (
    <div
      style={{
        display: active ? undefined : "none",
        flex: 1,
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}
