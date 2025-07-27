import {useState, useEffect} from 'react';
import { ping } from '@/app/utils/apiUtils';
import './references.css';
import { Typewriter } from 'react-simple-typewriter';
import ToolPill from './toolPill';
export function ReferencesContent({test,response}) {


    return (
        <div className="references-content">
            <div className='chat-container'>
                {/* {messages.map((message, index) => ( */}
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
                {/* )
            )}  */}

            </div>
                <div className='button-container'>
                      <button onClick={test} type="button" id='test' className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Hint</button>
                </div>

        </div>
    );
    


}

export function Tools({tools, details, addToolCode,  askAboutTool}) {
  console.log("tools",details)
      return (
    <div className="tools-container">
      <div className="tools-list">
        {tools.map((tool, index) => (
          <ToolPill addToolCode={addToolCode} details={details} askAboutTool={askAboutTool} key={index} name={tool.name} description={tool.description} />
        ))}
      </div>
    </div>
    )

}

export {ReferencesContent,Tools};
