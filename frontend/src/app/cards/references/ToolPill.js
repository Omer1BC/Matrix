import React, { useState } from 'react';
import './references.css'; 
function ToolPill({ name, details, description, code, addToolCode, askAboutTool }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="tool-pill">
      <div>
        <div className='info' onClick={() => setIsExpanded(!isExpanded)} style={{cursor: 'pointer'}}>
          <div className="tool-name">
            <span className="accordion-arrow">{isExpanded ? '▼' : '▶'} </span>
            {name} 
          </div>
          <div className="tool-description">{description}</div>
        </div>
        <div className="button-group">
          <button className="tool-button" onClick={() => askAboutTool(name,details)}>?</button>
        </div>
      </div>
      {isExpanded && (
        <div className="tool-code-section">
          <div className="code-block-container">
            <button 
              className="clipboard-button" 
              onClick={() => addToolCode(code)}
              title="Paste into editor"
            >
              <div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              </div>

              
            </button>
            <pre className="tool-code">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToolPill;