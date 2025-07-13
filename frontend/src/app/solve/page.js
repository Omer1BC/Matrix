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
  const [activeTab, setActiveTab] = useState("profile");
  const [output, setOutput] = useState("");

  const tabs = {
    profile: { label: "Tab 1", content: (<><p>Profile</p></>) },
    dashboard: { label: "Tab 2", content: (<><p>Dashboard</p></>) },
    settings: { label: "Tab 3", content: (<><p>Settings</p></>) },
    contacts: { label: "Tab 4", content: (<><p>contacts</p></>) },
  };

  const content = {
    vid: { label: "Video", content: (<><ReactPlayer className="react" controls={true} src='/vid.mp4' /></>) },

  };
  const references = {
    ai: { label: "AI", content: (<><p>AI</p></>) },

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
  const validation = {
    test: { label: "Tests", content: (<>
    <p>{output}</p>
    <button onClick={showValue} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Run</button>

    </>) },
  };

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

  const editorRef = useRef(null);

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
          <Card className="code" tabs={code} tabContent={tabContent} />
          <Card className="validation" tabs={validation} />

        
        
        
        </div>

    </div>

    </>
}

