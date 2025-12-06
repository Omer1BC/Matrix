import { useMemo, useState } from "react";

type TabContent = {
  label: React.ReactNode;
  content: React.ReactNode | (() => React.ReactNode);
};

export type TabsMap = Record<string, TabContent>;

type TabPanelProps = {
  tabs: TabsMap;
  className?: string;
  defaultActiveKey?: string;
  activeKey?: string;
  onTabChange?: (key: string) => void;
};

export default function TabPanel({
  tabs,
  className = "",
  defaultActiveKey,
  activeKey: controlledKey,
  onTabChange,
}: TabPanelProps) {
  const keys = useMemo(() => Object.keys(tabs), [tabs]);
  const firstKey = keys[0];

  const [internalActiveKey, setInternalActiveKey] = useState<string>(
    defaultActiveKey && tabs[defaultActiveKey] ? defaultActiveKey : firstKey
  );

  const currentActiveKey = controlledKey ?? internalActiveKey;

  const handleChange = (key: string) => {
    if (onTabChange) onTabChange(key);
    else setInternalActiveKey(key);
  };

  return (
    <div
      className={`relative flex flex-col min-h-0 gap-2 p-4 bg-[var(--background)] rounded-[var(--grid-border-radius)] ${className}`}
    >
      <div
        className="rounded-t-md"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div
          role="tablist"
          aria-label="Tabs"
          className="flex flex-wrap gap-1 px-4 -mb-px"
        >
          {keys.map((key) => {
            const isActive = key === currentActiveKey;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key}`}
                onClick={() => handleChange(key)}
                className={[
                  "relative inline-block px-5 py-3 rounded-t-md text-sm font-medium outline-none transition-colors duration-150 border-0 cursor-pointer",
                  isActive
                    ? "text-[var(--gr-2)] opacity-100"
                    : "text-neutral-400 opacity-70 hover:opacity-90 hover:text-[var(--gr-2)]",
                ].join(" ")}
              >
                {isActive && (
                  <span
                    className="absolute left-0 right-0 -bottom-[2px] h-[2px]"
                    style={{
                      backgroundColor: "var(--gr-2)",
                      boxShadow: "0 0 8px rgba(136, 250, 136, 0.4)",
                    }}
                  />
                )}
                {tabs[key].label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-1 min-h-0 rounded-md"
        style={{ backgroundColor: "var(--background)" }}
      >
        {keys.map((key) => {
          const isActive = key === currentActiveKey;
          const node = tabs[key].content;
          return (
            <div
              key={key}
              id={`panel-${key}`}
              role="tabpanel"
              aria-labelledby={key}
              className={isActive ? "flex flex-1 min-h-0" : "hidden"}
            >
              {typeof node === "function" ? node() : node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
