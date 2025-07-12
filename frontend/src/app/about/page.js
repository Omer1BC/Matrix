"use client";

import Image from "next/image";
import "../templates.css"
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu } from '@headlessui/react'
import ReactPlayer from 'react-player'
import {Editor} from '@monaco-editor/react'
import {useRef,useState} from 'react';
import Link from 'next/link'


const navigation = [
  { name: 'Tab 1', href: '#', current: true },
  { name: 'Tab 2', href: '#', current: false },
  { name: 'Tab 3', href: '#', current: false },
  { name: 'Tab 4', href: '#', current: false },
]

function classNames(...classes ) {
  return classes.filter(Boolean).join(' ')
}


// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
//               src/app/page.js
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

export default function Home() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "dashboard", label: "Dashboard" },
    { id: "settings", label: "Settings" },
    { id: "contacts", label: "Contacts" },
  ];
  const tabContent = {
    profile: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This is some placeholder content for the <strong className="font-medium text-gray-800 dark:text-white">Profile</strong> tab.
      </p>
    ),
    dashboard: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This is some placeholder content for the <strong className="font-medium text-gray-800 dark:text-white">Dashboard</strong> tab.
      </p>
    ),
    settings: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This is some placeholder content for the <strong className="font-medium text-gray-800 dark:text-white">Settings</strong> tab.
      </p>
    ),
    contacts: (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This is some placeholder content for the <strong className="font-medium text-gray-800 dark:text-white">Contacts</strong> tab.
      </p>
    ),
  };

  const editorRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }
    function showValue() {
    alert(editorRef.current.getValue());
  }
    return <>
    <div className="Page">
        <div className="main">
          <div className="content">
              <div id="header" className=" border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
                  {tabs.map((tab) => (
                    <li key={tab.id} className="me-2" role="presentation">
                      <button
                        type="button"
                        className={`inline-block p-4 border-b-2 rounded-t-lg ${
                          activeTab === tab.id
                            ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                            : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                        }`}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="vid">
                      <ReactPlayer  className="react" controls={true} src='/vid.mp4' />
              </div>
              
          </div> 

          {/* <div className="references"> */}
              {/* <div className="chat-container"> */}
                {/* <div className="chat-messages">
                  <div className="message user">Hi there!</div>
                  <div className="message bot">Hello! How can I help you?</div>
                  <div className="message user">What’s the weather?</div>
                  <div className="message bot">It’s sunny today 🌞</div>
                </div>  */}
                {/* <div className="chat-input">
                  <input type="text" placeholder="Type a message..." />
                  <button>Send</button>
                </div> */}
              {/* </div> */}
          {/* </div>   */}

          <div className="code">
                  <Editor 
                  height="80%" 
                  width="100%" 
                  language="python"
                  theme="vs-dark"
                  onMount={handleEditorDidMount}
                  />
                  <button style={{zIndex: 10,backgroundColor: "BLUE",cursor:"pointer"}} onClick={showValue}>Run</button>
          </div>

          <div className="validation"> 
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          {tabs.map((tab) => (
            <li key={tab.id} className="me-2" role="presentation">
              <button
                type="button"
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        {tabContent[activeTab]}
      </div>

          </div>          
        </div>

    </div>

    </>
}

