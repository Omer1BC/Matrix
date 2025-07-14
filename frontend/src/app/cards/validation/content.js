import {useState, useEffect} from 'react';
import './validation.css'
import { fetchProblemDetails } from '@/app/utils/apiUtils';
export default function ValidationContent({problemID,editorRef}) {
    const [number,setNumber] =useState(0);
    const [details,setDetails] = useState([]);
    const [activeTest,setActiveTest] = useState({});
    const [tests,setTests] = useState({});
    const [activeKey,setActiveKey] = useState(0);
useEffect(() => {
    fetchProblemDetails({problem_id:problemID}, "problem_details")
    .then(data => {
        if (editorRef.current) {
            editorRef.current.setValue(data.method_stub);
        }
        setDetails(data);
        const orig = data.tests 
        const fixedStr = orig.replace(/'/g, '"');
        const json = JSON.parse(fixedStr);
        setTests(json);
        
        setActiveTest(Object.values(json)[0]);
        setActiveKey(Object.keys(json)[0]);
        console.log(json)
    });

},[editorRef]);

    const test = () => {
        fetchProblemDetails({code: editorRef.current.getValue()}, "run").then(data => {
            console.log('button data',data)
            const fixedStr = data.replace(/'/g, '"');
            const json = JSON.parse(fixedStr);
            console.log('button json',json)
            setTests(json);
            // setTests(data);
        })
    }
    const getActiveColor = (activeKey, key) => {
        return activeKey === key ? "#b1e8efff" : "white";
    }

    return (
        <div className="validation-content">
            <div className="test-cases">
                {Object.entries(tests).map(([ky, val]) => (
                    <button style={{backgroundColor: getActiveColor(activeKey,ky)}} key={ky} className="test-case"  onClick={() => {setActiveTest(val); setActiveKey(ky);} }>Test Case {ky}
                        <span style={{backgroundColor: JSON.stringify(val.actual) !== JSON.stringify(val.expected) ? "red" : "green" }} className='circle'></span></button>

                ))}
                <div style={{paddingBottom: '10px'}}></div>
                <button onClick={test} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Test</button>


            </div>
            <div className="output">
                 <div className="output overflow-auto max-h-64">
                    {Object.entries(activeTest).map(([key, val]) => (
                    <>
                    <div>{key}</div>
                    <div className="bg-gray-100 rounded-md px-4 py-2 font-mono text-sm text-black shadow-sm">
                        {JSON.stringify(val)}
                    </div>
                    </>
                ))}
                 </div>

            </div>
        </div>
    );
    


}