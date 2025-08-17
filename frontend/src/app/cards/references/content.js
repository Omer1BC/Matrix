import {useState, useEffect} from 'react';
import { ping } from '@/app/utils/apiUtils';
import './references.css';
import { Typewriter } from 'react-simple-typewriter';
import ToolPill from './ToolPill';

export function ReferencesContent({viewHint,response,nextThread}) {
  const [ask,setAsk]= useState("")
  function handleChange(e) {
    console.log("ask",e.target.value)  
    setAsk(e.target.value);
  }
  function clickedSubmit() {
    nextThread(ask)
  }
    return (
        <div className="references-content">
            <div className='chat-container'>
                    <div className="chat-bubble" style={{textAlign: 'left'  }}> 
                        <span  ><Typewriter
                        words={[response]}
                        key = {response}
                        typeSpeed={25}
                        deleteSpeed={50}
                        delaySpeed={1000}
                        cursor
                        /></span>
                    </div>

            </div>

            <div className='input-container'>
                <input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => handleChange(e)}  value={ask} placeholder="What are you stuck on?" />
                <div className='button-container'>
                  <button type="submit" class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" onClick={clickedSubmit}>
                      <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      </svg>
                      <span class="sr-only">Search</span>
                  </button>
                  <button onClick={viewHint} type="button" id='test' className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Hint</button>
                </div>
            </div>

        </div>
    );
    


}

export function Tools({tools, details, addToolCode,  askAboutTool}) {
  console.log("passed tools",tools[0]?.code)
  return (
    <div className="tools-container">
      <div className="tools-list">
        {tools.map((tool, index) => (
          <ToolPill code={tool?.code} addToolCode={addToolCode} details={details} askAboutTool={askAboutTool} key={index} name={tool.name} description={tool.description} />
        ))}
      </div>
    </div>
  )

}

export {ReferencesContent,Tools};
