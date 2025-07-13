
import {useRef,useState, useEffect} from 'react';
import './card.css';

export default function Card({ tabs,className,content }) {
    // ...existing code for tabContent, update as needed to use dynamic tabs...
    const [activeTab, setActiveTab] = useState("profile");
    
    const tabContent = {
    profile: (
      <>
      <div>Output:</div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
       <strong className="font-medium text-gray-800 dark:text-white"></strong> 
      </p>
      </>

    ),
    dashboard: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tab 2 <strong className="font-medium text-gray-800 dark:text-white"></strong> tab.
      </p>
    ),
    settings: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tab 3 <strong className="font-medium text-gray-800 dark:text-white"></strong> tab.
      </p>
    ),
    contacts: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Tab 4 <strong className="font-medium text-gray-800 dark:text-white"></strong> tab.
      </p>
    ),
  };

    return (
        <>
            <div className={className}>
              <div id="header" className="border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                  {tabs.map((tab) => (
                    <li key={tab.id} className="me-2" role="presentation">
                      <button
                        type="button"
                        className={`inline-block p-4 border-b-2 rounded-t-lg ${
                          activeTab === tab.id
                            ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                        }`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div id="body">
                      {content}
                      {/* <ReactPlayer  className="react" controls={true} src='/vid.mp4' /> */}
              </div>
              
            </div> 
        </>
    )
}