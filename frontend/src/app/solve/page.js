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
  //defines an annotation div
  class HoverWidget {
    constructor(editor, monaco,i=1, message,n=1,type,replaceEditorLine) {
      this._editor = editor;
      this._monaco = monaco;
      this._message = message;
      this.i = i
      //Div that has a nested annotation message and a button
      this._domNode = document.createElement('div');
      this._domNode.className = 'my-hover-widget';
      
      const buttonSection = document.createElement('div');
      buttonSection.className = 'my-hover-widget-button-section';
      
      const button = document.createElement('button');
      button.className = 'my-hover-widget-button';
      button.textContent = '✔';
      button.onclick = () => replaceEditorLine(i,type,this._message);
      
      buttonSection.appendChild(button);
      
      const messageSection = document.createElement('div');
      messageSection.className = 'my-hover-widget-message';
      messageSection.textContent = message;

      this._domNode.appendChild(buttonSection);
      this._domNode.appendChild(messageSection);
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
    //Bias the position to show above the cursor
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

  const errorWidgetRefs = useRef([])
  const errorDecorationRefs = useRef([])

  const [textHighlights, setTextHighlights] = useState("");
  const [output, setOutput] = useState("");
  const [response,setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [details,setDetails] = useState({});


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
  //Hight to ask
  function handleMouseUp()  {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      setLoading(true);
      ping({
        text: selection.toString(),
        question: details?.title + "\n" + details?.description 
        },"ask")
      .then(data => {
        setResponse(data.response);
        setLoading(false);
      })
      .catch(() => setLoading(false));
      console.log("Selected text:", selection.toString());
    }
  }
  const annotateError = (codeError) => {  
    const editor = editorRef.current 
    const monaco = monacoRef.current
    const prev = errorDecorationRefs.current
    if (editor && monaco) {
      const model = editor.getModel()
      const n = model.getLineCount();
      let code = '';
      //Send the current code line-numbered 
      for (let i = 1; i <=n;i++) {
        code += `${i} | ${model.getLineContent(i)}\n`
      }
      //Ping the endpoint with the code /backend/api/views.py: annotate()
      // const data = {
      //   line_number_to_comment: {1: "def my_function(param1, param2):",
      //   2: "def another_function(param1):"} ,
      //   expalantions_of_hint: codeError,  
      // }
      setLoading(true);
      ping({code: code, error : codeError,id:1},"annotate_errors")
      .then((data) => {
        const resp = data.line_number_to_replacement
        setResponse(data.expalantions_of_hint)
        setLoading(false);      
        //Generate a new set of highlights for each annotation
        const decorations = Object.keys(resp).map(( line ) => 
          ({
            range: new monaco.Range(Number(line),1,Number(line),1),
            options:  {
              isWholeLine: true,
              className: "error-highlight"
            }
          })
        )
        errorDecorationRefs.current  = editor.deltaDecorations(prev,decorations)
        //Generate corrosponding pink anotation comments
        const widgets = Object.entries(resp).map(( [line,message],i ) => 
          (
            new HoverWidget(editor,monaco,i,message,Number(line),0,replaceEditorLine)
          )
        )
        errorWidgetRefs.current = widgets
        widgets.forEach((widg) => {
          editor.addContentWidget(widg)

        })

        })
      .catch(() => setLoading(false));


    }
    else {
      alert("Please wait for the editor to load and try again!")
    }


  }
  //Anotate the code editor 
  
  const annotate = () => {  
    const editor = editorRef.current 
    const monaco = monacoRef.current
    const prev = decorationRefs.current
    if (editor && monaco) {
      const model = editor.getModel()
      const n = model.getLineCount();
      let code = '';
      //Send the current code line-numbered 
      for (let i = 1; i <=n;i++) {
        code += `${i} | ${model.getLineContent(i)}\n`
      }
      //Ping the endpoint with the code /backend/api/views.py: annotate()
      setLoading(true);
      ping({code: code, tests : {}},"annotate")
      .then((data) => {
        const resp = data.line_number_to_comment
        setResponse(data.expalantions_of_hint)
        setLoading(false);      
        //Generate a new set of highlights for each annotation
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
        //Generate corrosponding pink anotation comments
        const widgets = Object.entries(resp).map(( [line,message],i ) => 
          (
            new HoverWidget(editor,monaco,i,message,Number(line),1,replaceEditorLine)
          )
        )
        widgetRefs.current = widgets
        widgets.forEach((widg) => {
          editor.addContentWidget(widg)
        })

        })
      .catch(() => setLoading(false));
    }
    else {
      alert("Please wait for the editor to load and try again!")
    }


  }

  function nextThread(input) {
    const problemQuestion = details?.title + "\n" + details?.description 
    const code = editorRef.current ? editorRef.current.getValue() : "";
    setLoading(true);
    ping({
      ask: input,
      code: code,
      question: problemQuestion,

    },"next_thread")
    .then(data => {
      setResponse(data.response);
      setLoading(false);
    })
    .catch(() => setLoading(false));

  }
  //When editor is loaded
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onMouseMove((e) => {
      //Registers hover events over the code editor
      console.log("errors",errorDecorationRefs.current)

      const position = e.target.position;
      if (!position ) {
         return; 
      } 
      const n = position.lineNumber;
      const model = editor.getModel()
      decorationRefs.current.forEach((id,i) => {
        const range  =  model.getDecorationRange(id);

        const widget = widgetRefs.current[i]

        //Check that a hover event occured over this higlight's line number
        if (range && range.startLineNumber==n ) {
            widget.n = range.startLineNumber
            widget.showAt(position)  //Show the current annotation
        
        }
        else 
          widget.hide()
      })

      errorDecorationRefs.current.forEach((id,i) => {
        const range  =  model.getDecorationRange(id);
        const widget = errorWidgetRefs.current[i]
        //Check that a hover event occured over this higlight's line number
        if (range && range.startLineNumber==n ) {
            widget.n = range.startLineNumber
            widget.showAt(position)  //Show the current annotation
        
        }
        else 
          widget.hide()
      })

    });
  }

  function replaceEditorLine(i,type,code) {
    const editor = editorRef.current;
    let prevRefs = null;
    let widgets = null;
    if (type == 0) {
      widgets = errorWidgetRefs.current
      prevRefs = errorDecorationRefs.current
      //Replace the line with the code
      const ln = editor.getModel().getDecorationRange(prevRefs[i]).startLineNumber;
      const range = new monacoRef.current.Range(ln, 1, ln, editor.getModel().getLineMaxColumn(ln));
      editor.executeEdits("", [{
      range: range,
      text: code
      }]);
      //Remove the decoration and widget, update the refs
      editor.deltaDecorations([prevRefs[i]],[])
      editor.removeContentWidget(widgets[i])
      errorDecorationRefs.current.splice(i,1)
      errorWidgetRefs.current.splice(i,1)
    }
    else {
      //Remove the decoration and widget, update the refs
      widgets = widgetRefs.current
      prevRefs = decorationRefs.current
      editor.deltaDecorations([prevRefs[i]],[])
      editor.removeContentWidget(widgets[i])
      decorationRefs.current.splice(i,1)
      widgetRefs.current.splice(i,1)
    }
  }
  const addQuestionTab =(title,difficulty,description) => {
    setContentTabs(prev => ({
      ...prev,
          question: {
      label: "Question", 
      content: (<><QuestionContent title={title} difficulty={difficulty} description={description} handleMouseUp={handleMouseUp} /></>)
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
  //When user presses the + button on a tool pill
  const addToolCode = (code) => {
    if (editorRef.current) {
      editorRef.current.setValue( "'''\n"+ code + "\n''''\n" + editorRef.current.getValue())
    }
  }
  //When user presses the ? button on a tool pill
  const askAboutTool = (pattern,deets) => {
     if (editorRef.current)
    {
        setLoading(true);
      ping({code: editorRef.current.getValue(),pattern: pattern},
        "tool_hints").then(data=>{
            setResponse(data.explanation)
            editorRef.current.setValue(data.updatedCode)
            setLoading(false);

        })
        .catch(() => setLoading(false));
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
      setLoading(true);
      ping({code: editorRef.current.getValue(),tests: ""},"hints")
      .then(data=>{
          setResponse(data.expalantions_of_hint)
          editorRef.current.setValue(data.annotated_code + "\n\n" + data.thought_provoking_test_case_to_consider_as_comment_block);
          setLoading(false);
        }
      )
      .catch(() => setLoading(false));
    }
  }
  /* Tabs */
  //Each card accepts a json defining the tabs {id: {label: "", content: </>}} 
  //label is the display name up content is the component that gets rendered
  const [validationTabs,setValidationTabs] = useState({
    test: { label: "Tests", 
            content: (<><ValidationContent annotateError={annotateError} editorRef={editorRef} problemID={1} output={output} /></>) 
          },
    })
  const [codeTabs,setCodeTabs] = useState({
    editor: {
      label: "Editor", 
      content: (
        <div className="editor-container" style={{borderRadius: ".5rem"}}>
          <Editor 

            language="python" 
            theme="vs-dark" 
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false }
            }}
          />
          <button 
            className="editor-run-button"
            title="AI Hint"
            onClick={() => annotate()}
          >
            <img src="ai.png" alt="AI" />
          </button>
        </div>
      )
      }
  })
  const [contentTabs,setContentTabs] = useState({
    question : {label: "Question",content: (<QuestionContent handleMouseUp={handleMouseUp} />)}
  })

  const references = {
    ai: { 
      label: <div className="ai-tab-label"><img src="ai.png" className="ai-tab-icon"/>Neo</div>, 
      content: (<><ReferencesContent viewHint={annotate} response={response} loading={loading} nextThread={nextThread}/></>) 
    },
  };

  return <>
    <div className="page">
        <Header />
        <div className="main">
          <Card className="content" tabs={contentTabs} />
          <Card className="references" tabs={references}  />
          <Card className="code" tabs={codeTabs} />
          <Card className="validation" tabs={validationTabs} />           
        </div>
    </div>
  </>
}