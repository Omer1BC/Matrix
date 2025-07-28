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
import problemCategories from "./accordian.js"

import { fetchProblemDetails } from '../utils/apiUtils';

// Problem Selection Drawer Component
const ProblemDrawer = ({ isOpen, onClose, onProblemSelect }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const drawerRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      drawerRef.current?.focus();
      
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

  

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleProblemSelect = (problem) => {
    setSelectedProblem(problem);
    onProblemSelect(problem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={drawerRef}
      tabIndex={-1}
      className="fixed top-0 left-0 w-1/3 h-full bg-gray-900 text-white shadow-2xl z-40 overflow-y-auto focus:outline-none"
      style={{ transform: 'translateX(0)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-400">Problem Bank</h2>
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
              Back to categories
            </button>
            
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">{problemCategories[activeSection].icon}</span>
              {problemCategories[activeSection].title}
            </h3>
            
            <div className="space-y-3">
              {problemCategories[activeSection].items.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                  onClick={() => handleProblemSelect(item)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {item.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Main menu sections
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Choose a category</h3>
            {Object.entries(problemCategories).map(([key, section]) => (
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
                      {section.items.length} problems
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

export default function ProblemsPage() {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [currentProblem, setCurrentProblem] = useState({
    id: "intro-1",
    title: "Hello World",
    description: "Write a program that prints 'Hello, World!' to the console.",
    difficulty: "Easy"
  });

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    // Set initial code based on current problem
    editor.setValue('# Write your solution here\nprint("Hello, World!")');
  }
  
  async function runCode() {
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

  const handleProblemSelect = (problem) => {
    setCurrentProblem(problem);
    // Update editor with starter code based on problem
    if (editorRef.current) {
      const starterCode = getStarterCode(problem.id);
      editorRef.current.setValue(starterCode);
    }
    setOutput(""); // Clear previous output
  };

  const getStarterCode = (problemId) => {
    const starterCodes = {
      "intro-1": '# Write a program that prints "Hello, World!"\nprint("Hello, World!")',
      "intro-2": '# Create variables and print them\nname = ""\nage = 0\nprint(f"Name: {name}, Age: {age}")',
      "ds-1": '# Work with lists\nnumbers = [1, 2, 3, 4, 5]\n# Add your code here',
      "sort-1": '# Implement bubble sort\ndef bubble_sort(arr):\n    # Your implementation here\n    pass\n\n# Test your function\ntest_array = [64, 34, 25, 12, 22, 11, 90]\nprint(bubble_sort(test_array))',
    };
    return starterCodes[problemId] || '# Write your solution here\n';
  };

  const urls = ['/vid.mp4', '/vid2.mp4'];
  const [idx, setIdx] = useState(0);
  const handleEnded = () => {
    setIdx(1);
  };

  return (
    <>
      <div className="Page relative min-h-screen bg-gray-100">
        {/* Toggle Button */}
        <button
          onClick={() => setDrawerToggle(!drawerToggle)}
          className={`absolute top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 ${
            drawerToggle ? 'hidden' : 'translate-x-0'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Problems
        </button>

        {/* Problem Selection Drawer */}
        <ProblemDrawer 
          isOpen={drawerToggle} 
          onClose={() => setDrawerToggle(false)}
          onProblemSelect={handleProblemSelect}
        />

        {/* Overlay for focus trap */}
        {drawerToggle && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setDrawerToggle(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <div 
          className={`transition-all duration-300 ${
            drawerToggle ? 'ml-[33vw] opacity-50 pointer-events-none' : 'ml-0'
          } p-6`}
        >
          {/* Centered Layout Container */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-6 h-screen">
              
              {/* Left Column - Exercise and Code Editor */}
              <div className="col-span-2 flex flex-col gap-4">
                
                {/* Exercise Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Exercise {currentProblem.id}: {currentProblem.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentProblem.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{currentProblem.description}</p>
                </div>

                {/* Code Editor */}
                <div className="bg-white rounded-lg shadow-lg flex-1 overflow-hidden">
                  <div className="h-full">
                    <Editor
                      height="100%"
                      width="100%"
                      language="python"
                      theme="vs-dark"
                      onMount={handleEditorDidMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>

                {/* Video Player */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Tutorial Video</h3>
                  <div className="aspect-video">
                    <ReactPlayer 
                      muted={true} 
                      playing={false}
                      className="react-player" 
                      onEnded={handleEnded} 
                      controls={true} 
                      src={urls[idx]}
                      width="100%"
                      height="100%"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Test Cases */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Test Cases</h3>
                  
                  <ValidationContent
                    editorRef={editorRef}
                    problemID={currentProblem.id}
                    button={
                      <button 
                        onClick={runCode} 
                        type="button" 
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm px-5 py-3 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-10V7a3 3 0 11-6 0V4" />
                        </svg>
                        Run Code
                      </button>
                    }
                    output={output} 
                  />
                  
                  {/* Output Display */}
                  {output && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Output:</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono overflow-auto max-h-32">
                        {output}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}