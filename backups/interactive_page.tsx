import "./templates.css"
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Disclosure, Menu } from '@headlessui/react'
import ReactPlayer from 'react-player'
import {Editor} from '@monaco-editor/react'
import {useRef} from 'react';
// import * as monaco from 'monaco-editor';
// type Monaco = typeof monaco;

const navigation = [
  { name: 'Tab 1', href: '#', current: true },
  { name: 'Tab 2', href: '#', current: false },
  { name: 'Tab 3', href: '#', current: false },
  { name: 'Tab 4', href: '#', current: false },
]

function classNames(...classes : (string | undefined | null )[] ) {
  return classes.filter(Boolean).join(' ')
}

export function Main() {

   const editorRef = useRef({});

// function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) {
//   editorRef.current = editor;
// }
  function showValue() {
    console.log("hello")
  }
    return <>
    <div className="Page">
        <div className="nav_menu">
    <Disclosure as="nav" className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex shrink-0 items-center">
                <img
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="h-8 w-auto"
                />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                    {navigation.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        aria-current={item.current ? 'page' : undefined}
                        className={classNames(
                        item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium',
                        )}
                    >
                        {item.name}
                    </a>
                    ))}
                </div>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <button
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <BellIcon aria-hidden="true" className="size-6" />
                </button>

            </div>
            </div>
        </div>
        </Disclosure>
        </div>
        <div className="main" >
        
            <div className="content">
                <div className="vid" style= {{display: "flex", justifyContent: "center",height: "100%",width: "100%"}}>
                    <div className="player-wrapper" >
                        <ReactPlayer height="100%" width="100%" controls={true} src='videos/proj_vid.mp4' />
                    </div>
                </div>
            </div>
            <div className="references">
            </div>
            <div className="code">
                    <Editor 
                    height="80%" 
                    width="100%" 
                    language="python"
                    theme="vs-dark"
                

                    />
                    <button style={{zIndex: 10,backgroundColor: "BLUE",cursor:"pointer"}} onClick={showValue}>Run</button>

            </div>
        <div className="validation">
            
        </div>
        
    </div>

    </div>

    </>
}