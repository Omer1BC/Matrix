"use client";

import Image from "next/image";
import "../templates.css"
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu } from '@headlessui/react'
import ReactPlayer from 'react-player'
import { Editor } from '@monaco-editor/react'
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link'
import Card from '../templates/card/card';
import ValidationContent from "../cards/validation/content";
import { ReferencesContent, Tools } from "../cards/references/content";
import { AnimationContent } from "../cards/content/content";

import { fetchProblemDetails } from '../utils/apiUtils';

// Learning Drawer Component with Tiered Menu
const LearningDrawer = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState(null);
  const drawerRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Focus the drawer when it opens
      drawerRef.current?.focus();
      
      // Trap focus within drawer
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const focusableElements = drawerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const menuSections = {
    concepts: {
      title: "Core Concepts",
      icon: "📚",
      items: [
        { id: "variables", title: "Variables & Data Types", description: "Learn about Python variables" },
        { id: "functions", title: "Functions", description: "Creating and using functions" },
        { id: "loops", title: "Loops & Iteration", description: "For and while loops" },
        { id: "conditionals", title: "Conditionals", description: "If, elif, else statements" }
      ]
    },
    examples: {
      title: "Code Examples",
      icon: "💡",
      items: [
        { id: "basic", title: "Basic Examples", description: "Simple Python programs" },
        { id: "algorithms", title: "Algorithms", description: "Common programming algorithms" },
        { id: "data-structures", title: "Data Structures", description: "Lists, dictionaries, sets" },
        { id: "file-handling", title: "File I/O", description: "Reading and writing files" }
      ]
    },
    practice: {
      title: "Practice Problems",
      icon: "🎯",
      items: [
        { id: "easy", title: "Easy Problems", description: "Beginner-friendly challenges" },
        { id: "medium", title: "Medium Problems", description: "Intermediate challenges" },
        { id: "hard", title: "Hard Problems", description: "Advanced challenges" },
        { id: "projects", title: "Mini Projects", description: "Small project ideas" }
      ]
    },
    resources: {
      title: "Resources",
      icon: "🔗",
      items: [
        { id: "docs", title: "Python Documentation", description: "Official Python docs" },
        { id: "tutorials", title: "Video Tutorials", description: "Curated learning videos" },
        { id: "cheatsheet", title: "Cheat Sheet", description: "Quick reference guide" },
        { id: "community", title: "Community", description: "Forums and help" }
      ]
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={drawerRef}
      tabIndex={-1}
      className="fixed top-0 left-0 w-1/4 h-full bg-gray-900 text-white shadow-2xl z-40 overflow-y-auto focus:outline-none"
      style={{ transform: 'translateX(0)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-400">Learning Hub</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close drawer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-4">
        {activeSection ? (
          // Detailed view of selected section
          <div>
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 mb-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to menu
            </button>
            
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">{menuSections[activeSection].icon}</span>
              {menuSections[activeSection].title}
            </h3>
            
            <div className="space-y-3">
              {menuSections[activeSection].items.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                  onClick={() => {
                    // Handle item selection
                    console.log(`Selected: ${item.title}`);
                  }}
                >
                  <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Main menu sections
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Choose a topic</h3>
            {Object.entries(menuSections).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all group hover:scale-105"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {section.title}
                    </div>
                    <div className="text-sm text-gray-400">
                      {section.items.length} items
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
        <div className="text-sm text-gray-400 text-center">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const [response, setResponse] = useState("")

  const [learningToggle, setLearningToggle] = useState(false);

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
      setOutput(data.output || data.error || "No output returned");
    } catch (err) {
      setOutput("Error sending POST request: " + err.message);
    }
  }
  
  const tool_hints = (pattern) => {
    if (editorRef.current) {
      fetchProblemDetails({ code: editorRef.current.getValue(), pattern: pattern },
        "tool_hints").then(data => {
          console.log('data', data)
          setResponse(data.explanation)
        })
    }
  }
  
  const hint = () => {
    if (editorRef.current) {
      fetchProblemDetails({ code: editorRef.current.getValue(), tests: "" },
        "hints").then(data => {
          console.log('data', data)
          setResponse(data.expalantions_of_hint)
          console.log("resp is", response)
          editorRef.current.setValue(data.annotated_code + "\n\n" + data.thought_provoking_test_case_to_consider_as_comment_block);
        })
    }
  }
  
  const urls = ['/vid.mp4', '/vid2.mp4']
  const [idx, setIdx] = useState(0)
  const handleEnded = () => {
    setIdx(1)
  }
  
  const content = {
    vid: { label: "Video", content: (<><ReactPlayer muted={true} playing={true} className="react" onEnded={handleEnded} controls={false} src={urls[idx]} /></>) },
    anim: { label: "Animation", content: (<AnimationContent />) }
  };

  const code = {
    editor: {
      label: "Editor", content: (<>
        <Editor
          height="100%"
          width="100%"
          language="python"
          theme="vs-dark"
          onMount={handleEditorDidMount}
        />
      </>)
    },
    tools: { label: "Tools", content: (<><Tools set_response={tool_hints} /></>) },
  };

  const validation = {
    test: {
      label: "Tests", content: (<>
        <ValidationContent
          editorRef={editorRef}
          problemID={1}
          button={<button onClick={showValue} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Run</button>}
          output={output} />
      </>)
    },
  };
  
  const references = {
    ai: { label: "AI", content: (<><ReferencesContent test={hint} response={response} /></>) },
  };

  return (
    <>
      <div className="Page relative">
        {/* Toggle Button */}
        <button
          onClick={() => setLearningToggle(!learningToggle)}
          className={`absolute top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 ${
            learningToggle ? 'hidden' : 'translate-x-0'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {learningToggle ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
          {learningToggle ? "Close" : "Menu"}
        </button>

        {/* Learning Drawer */}
        <LearningDrawer 
          isOpen={learningToggle} 
          onClose={() => setLearningToggle(false)} 
        />

        {/* Overlay for focus trap */}
        {learningToggle && (
          <div 
            className="fixed inset-0 bg-opacity-50 z-30"
            onClick={() => setLearningToggle(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <div 
          className={`main transition-all duration-300 ${
            learningToggle ? 'ml-[25vw] opacity-50 pointer-events-none' : 'ml-0'
          }`}
        >
          <Card className="content" tabs={content} />
          <Card className="references" tabs={references} />
          <Card className="code" tabs={code} />
          <Card className="validation" tabs={validation} />
        </div>
      </div>
    </>
  );
}