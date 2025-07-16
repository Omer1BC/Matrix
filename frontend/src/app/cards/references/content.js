import {useState, useEffect} from 'react';
import { fetchProblemDetails } from '@/app/utils/apiUtils';
import './references.css';
import { Typewriter } from 'react-simple-typewriter';
export default function RefrencesContent({problemID,editorRef}) {
    const messages = [
        { sender: 'user', text: 'Hi, how are you?' },
    ];
    const [data,setData] = useState({});
    const test = () => {
        // fetchProblemDetails({code: editorRef.current.getValue()}, "run").then(data => {
        //     console.log('button data',data)
        //     const fixedStr = data.replace(/'/g, '"');
        //     const json = JSON.parse(fixedStr);
        //     console.log('button json',json)
        //     setTests(json);
        //     // setTests(data);
        // })
        if (editorRef.current)
        {
            fetchProblemDetails({code: editorRef.current.getValue(),tests: ""},
            "hints").then(data=>{
                console.log('data',data)
                setData(data);
                editorRef.current.setValue(data.annotated_code + "\n\n" + data.thought_provoking_test_case_to_consider_as_comment_block);
            })


        }
    }


    return (
        <div className="references-content">
            <div className='chat-container'>
                {messages.map((message, index) => (
                    <div className="chat-bubble" key={index} style={{textAlign: 'left'  }}> 
                        <span  ><Typewriter
  words={[data?.expalantions_of_hint]}
  key = {data?.expalantions_of_hint || ""}
  typeSpeed={25}
  deleteSpeed={50}
  delaySpeed={1000}
  cursor
/></span>
                    </div>
                )
            )} 

            </div>
                <div className='button-container'>
                            <button onClick={test} type="button" id='test' className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Hint</button>

                </div>

        </div>
    );
    


}