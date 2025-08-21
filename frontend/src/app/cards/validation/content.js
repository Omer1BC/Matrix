import {useState, useEffect} from 'react';
import './validation.css'
import { ping } from '@/app/utils/apiUtils';
export default function ValidationContent({annotateError, problemID,editorRef}) {
    const [details,setDetails] = useState([]);
    const [activeTest,setActiveTest] = useState({});
    const [tests,setTests] = useState({});
    const [activeKey,setActiveKey] = useState(0);
    const [showVictoryModal, setShowVictoryModal] = useState(false);

    const fetchDetails = () => {
        ping({problem_id:problemID}, "problem_details")
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
    }
    
    useEffect(() => fetchDetails,[editorRef]);
    const test = () => {
        ping({problem_id: 1,code: editorRef.current.getValue()}, "tests")
        .then(data => {
            if (data.error !== 1) {
                const fixedStr = data.result.replace(/'/g, '"');
                const json = JSON.parse(fixedStr);

                setTests(json);
                console.log("tests:",json,json.length)
                // Filter for correct test cases
                const correctTests = Object.entries(json).filter(([key, val]) => 
                    {return JSON.stringify(val.actual) === JSON.stringify(val.expected)}
                );
                if (correctTests.length == Object.keys(json).length) {
                    setShowVictoryModal(true);
                }


            }
            else 
                annotateError(data.result);
        })
    }


    return (
        <div className="validation-content">
            <div className="test-cases">
                {Object.entries(tests).map(([ky, val]) => (
                    <button key={ky} className={`test-case ${activeKey === ky ? 'active' : ''}`}  onClick={() => {setActiveTest(val); setActiveKey(ky);} }>Test Case {ky}
                        <span className={`circle ${JSON.stringify(val.actual) !== JSON.stringify(val.expected) ? 'failure' : 'success'}`}></span></button>

                ))}
                <div style={{paddingBottom: '10px'}}></div>
                <button id='test-button' onClick={test} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Test</button>

            </div>
            <div className="output">
                 <div className="output-content">
                    {Object.entries(activeTest).map(([key, val]) => (
                    <>
                        <div>{key}</div>
                        <div className="test-output-value">
                            {JSON.stringify(val)}
                        </div>
                    </>
                ))}
                 </div>

            </div>
            
            {showVictoryModal && (
                <div className="victory-modal-overlay" onClick={() => setShowVictoryModal(false)}>
                    <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="victory-content">
                            <h2>🎉 Congratulations!</h2>
                            <p>All test cases passed successfully!</p>
                            <button 
                                className="victory-close-btn"
                                onClick={() => setShowVictoryModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    


}