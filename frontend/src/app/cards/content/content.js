import {useState,useEffect} from 'react'
import { fetchProblemDetails,get } from '@/app/utils/apiUtils';
import ReactPlayer from 'react-player'
import './content.css'
export function AnimationContent () {
    const [step,setStep] = useState(1)
    const prefix = 'http://localhost:8000/media/videos/2_Array/480p15/'
    const [vid,setVid] = useState(prefix + `step_${0}.mp4`)
    const [end,setEnd] = useState(false)

    // useEffect(() =>
    // {
    //     const newUrl = `http://localhost:8000/media/videos/2_Array/1080p60/step_0.mp4`;
    //     setVid(newUrl);
    // },[step])

    const handleEnded = () => {
        

    }
    const handleAnim = () => {
        get({data: {pattern:"Set",action:"self.play(arr.next(),run_time=3)",step:step}},"get_animation")
        .then(data => {
            console.log("Resp",data)
            setVid(prefix + `step_${step}.mp4`)
            setStep(prev => prev +1)

        })
    }

    return (
        <>
         <div className='container'>
            <ReactPlayer muted={true} controls={false} playing={true} className="react" onEnded={handleEnded}  src={vid}/>
            <button onClick={handleAnim} className="button">Button</button>
         </div>
        </>
    )
}