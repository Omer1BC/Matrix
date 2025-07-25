import React from 'react';
import './references.css'; 
function ToolPill({ name, description, set_response }) {
  return (
    <div className="tool-pill">
      <div className='info'>
      <div className="tool-name">{name}</div>
      <div className="tool-description">{description}</div>
      </div>
      <div>
        <button
        className="ml-auto bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
        onClick={() => alert(`Using tool: ${name}`)}>
        +
      </button>
        <button className="tool-button" onClick={() => set_response(name)}>?</button>
      </div>
    </div>
  );
}

export default ToolPill;