import {useState,useEffect} from 'react'
import { fetchProblemDetails,get } from '@/app/utils/apiUtils';
import ReactPlayer from 'react-player'

export function AnimationContent () {
    const [step,setStep] = useState(0)
    const [vid,setVid] = useState(`http://localhost:8000/media/videos/2_Array/1080p60/step_${step}.mp4`)
    const [end,setEnd] = useState(false)

    useEffect(() =>
    {
        const newUrl = `http://localhost:8000/media/videos/2_Array/1080p60/step_${step}.mp4`;
        setVid(newUrl);
    },[step])

    const handleEnded = () => {
        get({data: {pattern:"Set",action:"self.play(arr.next(),run_time=3)",step:step}},"get_animation")
        .then(data => {
            console.log("Resp",data)
        })
        setStep(prev => prev +1)
        setEnd(prev => !prev)

    }
    const handleAnim = () => {
        
    }

    return (
        <>
         <div>
            {/* <video width="640" height="360" controls>
  <source src="http://localhost:8000/media/videos/2_Array/1080p60/Array.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video> */}
            <ReactPlayer muted={true} controls={false} playing={true} className="react"  onEnded={handleEnded}  src={vid}/>
            <button>Button</button>
         </div>
        </>
    )
}