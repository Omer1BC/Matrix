import {useState, useEffect} from 'react';
import './validation.css'
import { ping } from '../../utils/apiUtils';

// StarGraph Component
function StarGraph({ metrics }) {
    const [expandedInfo, setExpandedInfo] = useState(null);
    const center = 200;
    const maxRadius = 80;
    const categories = Object.keys(metrics);
    const values = Object.values(metrics);
    
    // Define proper labels for each dimension
    const dimensionLabels = {
        readability: 'Readability',
        efficiency: 'Efficiency', 
        robustness: 'Robustness'
    };
    
    // Define explanations for each dimension
    const dimensionExplanations = {
        readability: 'You used "i" and "node" to each vertex. Consider using the same variable name throughout your code to improve clarity.',
        efficiency: 'How well your solution performs in terms of time and space complexity',
        robustness: 'How well your code handles edge cases and unexpected inputs'
    };
    
    // Calculate angle for each metric (360 degrees / number of metrics)
    const angleStep = (2 * Math.PI) / categories.length;
    
    // Generate points for the star
    const points = values.map((value, index) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const radius = (value / 5) * maxRadius; // Scale to max 5
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return { 
            x, 
            y, 
            value, 
            label: dimensionLabels[categories[index]] || categories[index]
        };
    });
    
    // Create path string for the star shape
    const pathString = points.map((point, index) => 
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
    
    // Grid circles (1-5 scale)
    const gridCircles = [1, 2, 3, 4, 5].map(level => (
        <circle 
            key={level}
            cx={center} 
            cy={center} 
            r={(level / 5) * maxRadius}
            fill="none" 
            stroke="#e5e7eb" 
            strokeWidth="1"
            opacity="0.5"
        />
    ));
    
    return (
        <div className="star-graph-container">
            <svg width="400" height="400" viewBox="0 0 400 400">
                {/* Grid circles */}
                {gridCircles}
                
                {/* Grid lines to each metric */}
                {points.map((point, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const endX = center + maxRadius * Math.cos(angle);
                    const endY = center + maxRadius * Math.sin(angle);
                    return (
                        <line 
                            key={index}
                            x1={center} 
                            y1={center} 
                            x2={endX} 
                            y2={endY}
                            stroke="#e5e7eb" 
                            strokeWidth="1"
                            opacity="0.5"
                        />
                    );
                })}
                
                {/* Star shape filled area */}
                <path 
                    d={pathString} 
                    fill="rgba(34, 197, 94, 0.3)" 
                    stroke="rgb(34, 197, 94)" 
                    strokeWidth="2"
                />
                
                {/* Points for each metric */}
                {points.map((point, index) => (
                    <circle 
                        key={index}
                        cx={point.x} 
                        cy={point.y} 
                        r="4" 
                        fill="rgb(34, 197, 94)"
                    />
                ))}
                
                {/* Labels with Values */}
                {points.map((point, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const labelRadius = maxRadius + 40;
                    const labelX = center + labelRadius * Math.cos(angle);
                    const labelY = center + labelRadius * Math.sin(angle);
                    
                    return (
                        <g key={index}>
                            {/* Dimension Label */}
                            <text 
                                x={labelX} 
                                y={labelY - 8} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontSize="13" 
                                fill="var(--gr-2)"
                                fontWeight="700"
                            >
                                {point.label}
                            </text>
                            {/* Score Value */}
                            <text 
                                x={labelX} 
                                y={labelY + 8} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontSize="12" 
                                fill="var(--gr-2)"
                                fontWeight="600"
                            >
                                {point.value.toFixed(1)}/5
                            </text>
                            {/* Info Icon */}
                            <circle 
                                cx={labelX + 50} 
                                cy={labelY - 8} 
                                r="8" 
                                fill="var(--gr-2)" 
                                style={{cursor: 'pointer'}}
                                onClick={() => setExpandedInfo(expandedInfo === categories[index] ? null : categories[index])}
                            />
                            <text 
                                x={labelX + 50} 
                                y={labelY - 8} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                fontSize="10" 
                                fill="var(--dbl-1)"
                                fontWeight="700"
                                style={{cursor: 'pointer', pointerEvents: 'none'}}
                            >
                                i
                            </text>
                        </g>
                    );
                })}
            </svg>
            {/* Expanded Info Display */}
            {expandedInfo && (() => {
                const expandedIndex = categories.indexOf(expandedInfo);
                const angle = expandedIndex * angleStep - Math.PI / 2;
                const labelRadius = maxRadius + 40;
                const labelX = center + labelRadius * Math.cos(angle);
                const labelY = center + labelRadius * Math.sin(angle);
                
                return (
                    <div 
                        className="metric-info-tooltip"
                        style={{
                            left: `${labelX}px`,
                            top: `${expandedInfo === 'readability' ? labelY - 170 : Math.min(labelY - 140, center - 160)}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="metric-info-content">
                            <strong>{dimensionLabels[expandedInfo]}</strong>
                            <p>{dimensionExplanations[expandedInfo]}</p>
                            <button 
                                className="info-close-btn"
                                onClick={() => setExpandedInfo(null)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
export default function ValidationContent({annotateError, problemID,editorRef}) {
    const [details,setDetails] = useState([]);
    const [activeTest,setActiveTest] = useState({});
    const [tests,setTests] = useState({});
    const [activeKey,setActiveKey] = useState(0);
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [hasError, setHasError] = useState(false);

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
        setHasError(false); // Reset error state when starting new test
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
            else {
                setHasError(true); // Set error state when there's an error
                annotateError(data.result);
            }
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
                <button 
                    id='test-button' 
                    onClick={test} 
                    type="button" 
                    className="focus:outline-none text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
                    style={{
                        backgroundColor: hasError ? 'var(--failure-color)' : 'var(--gr-2)',
                        color: 'var(--dbl-1)'
                    }}
                >
                    Test
                </button>

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
                            
                            {/* Star Graph with Integrated Metrics */}
                            <div className="metrics-container">
                                <StarGraph metrics={{
                                    robustness: 5,
                                    efficiency: 5,
                                    readability: 3,
                                }} />
                            </div>
                            
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