import { useRef, useState, useEffect } from "react";
import "./card.css";

export default function Card({
  tabs,
  className,
}: {
  tabs: any;
  className: string;
}) {
  const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);

  return (
    <div className={`bg-background ${className} flex flex-col h-full min-h-0`}>
      {/* Tab headers */}
      <div id="header">
        <div className="tab-list flex border-b border-gray-700" role="tablist">
          {Object.keys(tabs).map((key) => {
            const tab = tabs[key];
            return (
              <button
                key={key}
                type="button"
                className={`tab-button px-4 py-2 ${
                  activeTab === key ? "active font-bold" : ""
                }`}
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

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {Object.keys(tabs).map((key) => (
          <TabPanel key={key} active={activeTab === key}>
            {typeof tabs[key].content === "function"
              ? tabs[key].content()
              : tabs[key].content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}

function TabPanel({ active, children }: { active: boolean; children: any }) {
  return (
    <div
      style={{
        display: active ? "block" : "none",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}
