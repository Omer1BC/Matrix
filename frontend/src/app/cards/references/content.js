import {useState, useEffect} from 'react';
import { fetchProblemDetails } from '@/app/utils/apiUtils';
import './references.css';
import { Typewriter } from 'react-simple-typewriter';
import ToolPill from './ToolPill';
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

export function Tools({set_response}) {
  const tools = [
    { name: 'Sorting', description: 'Depth-First Search algorithm' },
    { name: 'Set', description: 'Collection of unique elements' },
    { name: 'Hashmap', description: 'Key-value data structure' },
  ];
      return (
    <div className="tools-container">
      <div className="tools-list">
        {tools.map((tool, index) => (
          <ToolPill set_response={set_response} key={index} name={tool.name} description={tool.description} />
        ))}
      </div>
    </div>
    )

}

export {ReferencesContent,Tools};
