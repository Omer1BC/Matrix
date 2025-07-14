
import {useRef,useState, useEffect} from 'react';
import './card.css';

export default function Card({ tabs,tabContent, className,content,kvp}) {

    const [activeTab, setActiveTab] = useState(Object.keys(tabs)[0]);
    return (
        <>
            <div className={className}>
              <div id="header" className="border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                  {Object.keys(tabs).map((key) => { 
                    const tab = tabs[key]
                    return (
                    
                    <li key={key} className="me-2" role="presentation">
                      <button
                        type="button"
                        className={`inline-block p-4 border-b-2 rounded-t-lg ${
                          activeTab === key
                            ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                        }`}
                        role="tab"
                        aria-selected={activeTab === key}
                        onClick={() => setActiveTab(key)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ) }) }
                </ul> 
              </div>
              <div id="body">
                      {/* {content} */}
                      {tabs[activeTab].content}
              </div>
              
            </div> 
        </>
    )
}