//Defines custom test case for each pattern
import {useState,useEffect} from 'react'
import { ping } from '../utils/apiUtils';
import ReactPlayer from 'react-player'
import './mappings.css'

export const patternToTabs = {
    arrays : {test: (props) => <ArrayTest {...props}/>,video: (props) => <AnimationPlayer {...props}/>}

}

function ArrayTest({args, addToolAnimation, name}) {
    const [input,setInput] = useState("")
    const [inputs,setInputs] = useState(Object.entries(args).map(([k,v]) => (v.default_value) ))

    useEffect(() => {
        setInputs(Object.entries(args).map(([k,v]) => (v.default_value) ))
    },[args])

    useEffect(() => {
        addToolAnimation(input)
        setVideoLink()
    },[])


    async function setVideoLink () {
        const data = (Object.keys(args).map( (key,i) => key + " = " + inputs[i]))

        const resp = await ping({"data": data,name: name},"get_pattern_media")
        const bustCache = Date.now(); // or Math.random()
        const target = `http://localhost:8000/${resp.data}?v=${bustCache}`;
        addToolAnimation(target)
    }

    const handleChange = (i) => (e) => {
        const newVals = [...inputs]
        newVals[i] = e.target.value 
        setInputs(newVals)
    }

return (
    <div className="validation-content">
        <div className="test-cases">
            <button  className="test-case">Test Case
                <span style={{backgroundColor: "green" }} className='circle'></span></button>
                <div style={{paddingBottom: '10px'}}></div>
                <button id='test-button' onClick={setVideoLink} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Test</button>

        </div>
            <div className="output">
                {Object.entries(args).map( ([k,v],i) => (
                    <div className="output-content" key={k}>
                        <div>{k}</div>
                        <div className="test-output-value">
                            <input value={inputs[i]} onChange={ handleChange(i)} type="string" style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit'}}/>
                        </div>  
                    </div>
                ))}
            </div>


    </div>
)

}

export function AnimationPlayer({name,url}) {

    return (
        <>
        <div className='anim-container'>
            <ReactPlayer 
                key={url} 
                muted={true} 
                controls={false} 
                playing={true} 
                className="react" 
                src={url}
            />
        </div>
        </>
    )
}

export default patternToTabs;
// export {AnimationPlayer,ArrayTest}