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
import { fetchProblemDetails } from '../utils/apiUtils';

const navigation = [
  { name: 'Tab 1', href: '#', current: true },
  { name: 'Tab 2', href: '#', current: false },
  { name: 'Tab 3', href: '#', current: false },
  { name: 'Tab 4', href: '#', current: false },
]

function classNames(...classes ) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  const [output, setOutput] = useState("");

  const content = {
    vid: { label: "Video", content: (<><ReactPlayer className="react" controls={true} src='/vid.mp4' /></>) },

  };
  const references = {
    ai: { label: "AI", content: (<><p></p></>) },

  };
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

  };



  const editorRef = useRef(null);
  const validation = {
    test: { label: "Tests", content: (<>
    <ValidationContent 
     editorRef={editorRef}
    problemID={1} 
    button={ <button onClick={showValue} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Run</button>}
    output={output} />
    </>) },
  };

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
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
    return <>
    <div className="Page">
        <div className="main">
          <Card className="content" tabs={content} />
          <Card className="references" tabs={references}  />
          <Card className="code" tabs={code} />
          <Card className="validation" tabs={validation} />        
        
        </div>

    </div>

    </>
}

