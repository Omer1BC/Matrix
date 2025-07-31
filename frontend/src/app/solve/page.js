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
  class HoverWidget {
    constructor(editor, monaco, message,n=1) {
      this._editor = editor;
      this._monaco = monaco;
      this._message = message;
      this._domNode = document.createElement('span');
      this._domNode.className = 'my-hover-widget';
      this._domNode.textContent = message;
      this._id = `hover.widget-${n}`;
      this._position = null;
      this.n = n
    }

    getId() {
      return this._id;
    }

    getDomNode() {
      return this._domNode;
    }

    getPosition() {
      if (!this._position) return null;
      return {
        position: this._position,
        preference: [
          this._monaco.editor.ContentWidgetPositionPreference.ABOVE,
          this._monaco.editor.ContentWidgetPositionPreference.BELOW,
        ],
      };
    }

    showAt(position) {
      this._position = position;
      this._editor.layoutContentWidget(this);
    }

    hide() {
      this._position = null;
      this._editor.layoutContentWidget(this);
    }
  }

  /*States */
  const editorRef = useRef(null);
  const widgetRef = useRef(null)
  const monacoRef = useRef(null)
  const widgetRefs = useRef([])
  const decorationRefs = useRef([])


  const [output, setOutput] = useState("");
  const [response,setResponse] = useState("")
  const [details,setDetails] = useState({});

  const createNewWidget = (message) => {
    const editor = editorRef.current
    const monaco = monacoRef.current
    const prev = widgetRef.current
    if (editor && monaco) {
      if (prev)
          editor.removeContentWidget(prev)

      const newWidget = new HoverWidget(editor,monaco,message)
      editor.addContentWidget(newWidget)
      widgetRef.current = newWidget 
    }

  }
  

  /*Init Problem Info */
  useEffect(() => {
    ping({problem_id:1}, "problem_details")
    .then(data => {
        if (editorRef.current) {
            editorRef.current.setValue(data.method_stub);
        }
        setDetails(data);
    });
  },[])

  useEffect(()=> {
    addToolsTab(Object.entries(details?.tools ? details?.tools : {}).map(([name,info]) => ({name: name, description: info?.description, code: info?.code})))
    addQuestionTab(details?.title,details?.difficulty,details?.description)
  },[details])

  /*Methods*/
  const annotate = () => {
    
    const editor = editorRef.current 
    const monaco = monacoRef.current
    const prev = decorationRefs.current
    if (editor && monaco) {
      const model = editor.getModel()
      const n = model.getLineCount();
      let code = '';
      for (let i = 1; i <=n;i++) {
        code += `${i} | ${model.getLineContent(i)}\n`
      }
      ping({code: code, tests : {}},"annotate")
      .then((data) => {

        const resp = data.line_number_to_comment
        setResponse(data.expalantions_of_hint)
        
        const decorations = Object.keys(resp).map(( line ) => 
          ({
            range: new monaco.Range(Number(line),1,Number(line),1),
            options:  {
              isWholeLine: true,
              className: "highlight"
            }
          })
        )
        decorationRefs.current  = editor.deltaDecorations(prev,decorations)
        const widgets = Object.entries(resp).map(( [line,message] ) => 
          (
            new HoverWidget(editor,monaco,message,Number(line))
          )
        )
        widgetRefs.current = widgets
        widgets.forEach((widg) => {
          editor.addContentWidget(widg)
        })

        })
    }
    else {
      alert("Please wait for the editor to load and try again!")
    }


  }


  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;


    editor.onMouseMove((e) => {
      const position = e.target.position;
      if (!position || decorationRefs.current.length == 0 || widgetRefs.current.length == 0) {
         return; 
      } 
      const n = position.lineNumber;


    const model = editor.getModel()
    decorationRefs.current.forEach((id,i) => {
    const range  =  model.getDecorationRange(id);
    const widget = widgetRefs.current[i]
    if (range && range.startLineNumber==n ) 
      widget.showAt(position)
    else 
      widget.hide()
    })

    });
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
     if (editorRef.current)
    {
        ping({code: editorRef.current.getValue(),pattern: pattern},
        "tool_hints").then(data=>{
            setResponse(data.explanation)
            editorRef.current.setValue(data.updatedCode)

        })
    } 

    setValidationTabs(prev => ({
      ...prev,
      custom  : {label: `Custom Test`, content: () => <patternToTabs.arrays.test args={details?.tools[pattern].args} addToolAnimation={addToolAnimation} name={pattern}/>}
      })
    );
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
      content: (<><ReferencesContent viewHint={annotate} response={response}/></>) 
    },
  };



  return <>
    <div className="Page">
        <Header createNewWidget={annotate}/>
        <div className="main">
          <Card className="content" tabs={contentTabs} />
          <Card className="references" tabs={references}  />
          <Card className="code" tabs={codeTabs} />
          <Card className="validation" tabs={validationTabs} />           
        </div>
    </div>
  </>
}

