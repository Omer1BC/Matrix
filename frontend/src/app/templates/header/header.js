import { useState } from "react"
export default function Header ({createNewWidget}) {
    const [input,setInput] = useState("")
    return <>
        <div className="container">
            <img className="logo" src="/favicon.png" style={{ width: "40px", height: "40px" }} alt="Logo" />
            <input onChange={(e) => setInput(e.target.value)} value={input} type="text"></input>
        </div>
    </>
}

