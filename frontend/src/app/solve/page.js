"use client";

import "../templates.css"
import {Editor} from '@monaco-editor/react'
import {useRef,useState, useEffect} from 'react';
import Card from '../templates/card/card';
import Header from '../templates/header/header';

import ValidationContent from "../cards/validation/content";
import {ReferencesContent,Tools} from "../cards/references/content";
import {patternToTabs} from '../patterns/mappings'
import { ping } from '../utils/apiUtils';
import { QuestionContent } from "../cards/content/content";

export default function Home({id}) {
  /*States */
  const [url,setUrl] = useState('')
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  const [response,setResponse] = useState("")
  const [details,setDetails] = useState({});

  /*Init Problem Info */
  useEffect(() => {
    ping({problem_id:1}, "problem_details")
    .then(data => {
        if (editorRef.current) {
            editorRef.current.setValue(data.method_stub);
        }
        const info = Object.entries(data?.tools ? data?.tools : {}).map(([name,info]) => ({name: name, description: info?.description}))
        setDetails(data);
    });
  },[])

  useEffect(()=> {
    addToolsTab(Object.entries(details?.tools ? details?.tools : {}).map(([name,info]) => ({name: name, description: info?.description, code: info?.code})))
    addQuestionTab(details?.title,details?.difficulty,details?.description)
  },[details])



  /*Methods*/
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
  }

  const addQuestionTab =(title,difficulty,description) => {
    setContentTabs(prev => ({
      ...prev,
          question: {
      label: "Question", 
      content: (<><QuestionContent title={title} difficulty={difficulty} description={description}/></>)
      }
    }))
  }
  //Tool methods
  const addToolsTab = (toolsInfo) => {
    setCodeTabs( prev => ({
      ...prev,
      tools: { 
        label: "Tools", 
        content: (<><Tools tools={toolsInfo} addToolCode={addToolCode}  askAboutTool={askAboutTool}/></>) 
        }    

    })
    )
  }

  const addToolAnimation =  (link) => {
      setContentTabs(prev => ({
      ...prev,
        custom  : {label:`Custom Animation`, content:  () => <patternToTabs.arrays.video url={link.length > 0 ? link : null} />}
      })
    ); 
  }
  const addToolCode = (code) => {
    if (editorRef.current) {
      editorRef.current.setValue( "'''\n"+ code + "\n''''\n" + editorRef.current.getValue())
    }
  }
  const askAboutTool = (pattern,deets) => {
    /* if (editorRef.current)
    {
        ping({code: editorRef.current.getValue(),pattern: pattern},
        "tool_hints").then(data=>{
            setResponse(data.explanation)
            editorRef.current.setValue(data.updatedCode)

        })
    } */
    
    // console.log("asking",'|','|',pattern,details?.tools[pattern].args)
    setValidationTabs(prev => ({
      ...prev,
      custom  : {label: `Custom Test`, content: () => <patternToTabs.arrays.test args={details?.tools[pattern].args} addToolAnimation={addToolAnimation} name={pattern}/>}
      })
    );

    
    // addToolAnimation(url)
    // setContentTabs(prev => ({
    //   ...prev,
    //   custom  : {label:`Custom Animation`, content:  () => <patternToTabs.arrays.video url={url} />}
    //   })
    // ); 
  }
  //AI Hint
  const hint = () => {
    if (editorRef.current)
    {
      ping({code: editorRef.current.getValue(),tests: ""},"hints")
      .then(data=>{
          setResponse(data.expalantions_of_hint)
          editorRef.current.setValue(data.annotated_code + "\n\n" + data.thought_provoking_test_case_to_consider_as_comment_block);
        }
      )
    }
  }
  /* Tabs */
  const [validationTabs,setValidationTabs] = useState({
    test: { label: "Tests", 
            content: (<><ValidationContent editorRef={editorRef} problemID={1} output={output} /></>) 
          },
    })
  const [codeTabs,setCodeTabs] = useState({
    editor: {
      label: "Editor", 
      content: (<><Editor height="100%" width="100%" language="python"theme="vs-dark"onMount={handleEditorDidMount} /></>)
      }
  })
  const [contentTabs,setContentTabs] = useState({
    question : {label: "Question",content: (<QuestionContent/>)}
  })
  const references = {
    ai: { 
      label: "AI", 
      content: (<><ReferencesContent test={hint} response={response}/></>) 
    },
  };



  return <>
    <div className="Page">
        <Header/>
        <div className="main">
          <Card className="content" tabs={contentTabs} />
          <Card className="references" tabs={references}  />
          <Card className="code" tabs={codeTabs} />
          <Card className="validation" tabs={validationTabs} />           
        </div>
    </div>
  </>
}

