"use client";

import Image from "next/image";
import "../templates.css"
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu } from '@headlessui/react'
import ReactPlayer from 'react-player'
import {Editor} from '@monaco-editor/react'
import {useRef,useState, useEffect} from 'react';
import Link from 'next/link'
import Card from '../templates/card/card';
import ValidationContent from "../cards/validation/content";
import {ReferencesContent,Tools} from "../cards/references/content";
import {AnimationContent} from "../cards/content/content";
import {patternToTabs} from '../patterns/mappings'
import { ping } from '../utils/apiUtils';


export default function Home() {
  const urls = ['/vid.mp4','/vid2.mp4']
  const [url,setUrl] = useState('')

useEffect(() => {
  console.log('url changed to:', url);
}, [url]);

  const [idx,setIdx] = useState(0)
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
    const handleEnded = () => {
    setIdx(1)
  }
  async function showValue() {
    let val = editorRef.current.getValue();
    try {
      const res = await fetch("http://localhost:8000/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: val }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "No output returned"); // Set output state
    } catch (err) {
      setOutput("Error sending POST request: " + err.message);
    }
  }
  const [validtn,setValidation] = useState({
    test: { label: "Tests", content: (<>
    <ValidationContent 
     editorRef={editorRef}
    problemID={1} 
    button={ <button onClick={showValue} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Run</button>}
    output={output} />
    </>) },
    
  })
  const [content,setContent] = useState(  {
    vid: { label: "Video", content: (<><ReactPlayer muted={true} playing={true} className="react"  onEnded={handleEnded} controls={false} src={urls[idx]} /></>) },
    anim: {label: "Animation",content: (<AnimationContent/>)}
  }
  )
  const [response,setResponse] = useState("")
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const update_valid =  (link) => {
       setContent(prev => ({
      ...prev,
    custom  : {label:`Custom Animation`, content:  () => <patternToTabs.arrays.video url={link} />}
      })); 
  }
  const tool_hints = (pattern) => {
    // if (editorRef.current)
    // {
    //     ping({code: editorRef.current.getValue(),pattern: pattern},
    //     "tool_hints").then(data=>{
    //         console.log('data',data)
    //         setResponse(data.explanation)
    //         // editorRef.current.setValue(data.updatedCode)

    //     })
    // }
    // setUrl('http://localhost:8000/media/videos/Array/480p15/Array.mp4')
    setValidation(prev => ({
      ...prev,
    custom  : {label: `Custom Test`, content: () => <patternToTabs.arrays.test setLink={update_valid} setUrl={setUrl} name={pattern}/>}


      }));
      
     setContent(prev => ({
      ...prev,
    custom  : {label:`Custom Animation`, content:  () => <patternToTabs.arrays.video url={url} />}
      })); 
  }
  const hint = () => {
        if (editorRef.current)
        {
            ping({code: editorRef.current.getValue(),tests: ""},
            "hints").then(data=>{
                console.log('data',data)
                setResponse(data.expalantions_of_hint)
                console.log("resp is",response)
                editorRef.current.setValue(data.annotated_code + "\n\n" + data.thought_provoking_test_case_to_consider_as_comment_block);
            })


        }

    }



  const code = {
    editor: { label: "Editor", content: (<>
                  <Editor 
                  height="100%" 
                  width="100%" 
                  language="python"
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  />
                    </>) },
    tools: { label: "Tools", content: (<><Tools set_response={tool_hints}/></>) },


  };


  const references = {
    ai: { label: "AI", content: (<><ReferencesContent test={hint} response={response}/></>) },
  };

    return <>
    <div className="Page">
        <div className="main">
          <Card className="content" tabs={content} />
          <Card className="references" tabs={references}  />
          <Card className="code" tabs={code} />
          <Card className="validation" tabs={validtn} />        
        
        </div>

    </div>

    </>
}

