//Defines custom test case for each pattern
import {useState,useEffect} from 'react'
import { ping } from '@/app/utils/apiUtils';
import ReactPlayer from 'react-player'

export const patternToTabs = {
    arrays : {test: (props) => <ArrayTest {...props}/>,video: (props) => <AnimationPlayer {...props}/>}

}

function ArrayTest({setUrl,name}) {
    const [input,setInput] = useState("")
    async function setVideoLink () {
        const resp = await ping({"data": input,name: name},"get_pattern_media")
        const target = `http://localhost:8000${resp.data}`
        console.log("setting",target,)
        setUrl(target)
    }

return (
    <div className="validation-content">
        <div className="test-cases">
            <button  className="test-case">Test Case
                <span style={{backgroundColor: true ? "red" : "green" }} className='circle'></span></button>
                <div style={{paddingBottom: '10px'}}></div>
                <button onClick={setVideoLink} type="button" className="focus:outline-none text-white bg-green-700  focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Test</button>

        </div>
            <div className="output">
                <div>{"Array"}</div>
                <div className="bg-gray-100 rounded-md px-4 py-2 font-mono text-sm text-black shadow-sm">
                    <input defaultValue={input} type="string"/>
                </div>
            </div>


    </div>
)

}

export function AnimationPlayer({name,url}) {
    // const url = `http://localhost:8000/media/patterns/${name}.mp4`
    useEffect(()=> {
        console.log("In Animation player",url)
    },[url])
    return (
        <>
        <div className='container'>
            <ReactPlayer key={url} muted={true} controls={false} playing={true} className="react"  src={url} />
        </div>
        </>
    )
}

export default patternToTabs;
// export {AnimationPlayer,ArrayTest}