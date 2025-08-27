import {useState, useEffect, useRef} from 'react';
import { ping } from '@/app/utils/apiUtils';
import './references.css';
import { Typewriter } from 'react-simple-typewriter';
import ToolPill from './ToolPill';

export function ReferencesContent({viewHint,response,loading,nextThread}) {
  const [ask,setAsk]= useState("")
  const [conversation, setConversation] = useState([])
  const chatContainerRef = useRef(null)
  
  useEffect(() => {
    if (response && response.trim()) {
      setConversation(prev => [...prev, { type: 'ai', content: response }])
    }
  }, [response])
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation, loading])
  
  function handleChange(e) {
    console.log("ask",e.target.value)  
    setAsk(e.target.value);
  }
  function clickedSubmit() {
    if (ask.trim()) {
      setConversation(prev => [...prev, { type: 'user', content: ask }])
      nextThread(ask)
      setAsk("")
    }
  }
  
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      clickedSubmit()
    }
  }
    return (
        <div className="references-content">
            <div className='chat-container' ref={chatContainerRef}>
                {conversation.map((message, index) => (
                    <div 
                        key={index} 
                        className={`chat-bubble ${message.type === 'user' ? 'user-bubble' : 'ai-bubble'}`} 
                        style={{textAlign: message.type === 'user' ? 'right' : 'left'}}> 
                        {message.type === 'ai' ? (
                            <div className="ai-message-content">
                                <div className="ai-icon">
                                    <img src="/matrix_logo.png" alt="Matrix AI" className="w-4 h-4" />
                                </div>
                                <div className="ai-text">
                                  <div className="highlight-ai">
                                    {index === conversation.length - 1 ? (
                                        <Typewriter
                                            words={[message.content]}
                                            key={message.content}
                                            typeSpeed={25}
                                            deleteSpeed={50}
                                            delaySpeed={1000}
                                            cursor/>
                                    ) : (
                                        message.content
                                    )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="user-message-content">
                                                                <div className="highlight-user">
                                                                  <div className="user-text">{message.content}</div>
</div>

                                <div className="user-icon">👤</div>
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble ai-bubble" style={{textAlign: 'left'}}>
                        <div className="ai-message-content">
                            <div className="ai-icon">
                                <img src="/matrix_logo.png" alt="Matrix AI" className="w-5 h-5" />
                            </div>
                            <div className="ai-text">
                                <div className="highlight-ai">
                                    <div className="loading-dots">
                                        <span>.</span><span>.</span><span>.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='input-container'>
                <input type="text" id="simple-search"  className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={(e) => handleChange(e)} onKeyDown={handleKeyDown} value={ask} placeholder="What are you stuck on?" />
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
