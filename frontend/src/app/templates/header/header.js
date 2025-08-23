import { useState } from "react"
import "./header.css"
export default function Header () {
    return <>
        <div className="header-div">
            <img className="imgg-icon" src={"matrix_logo.png"}></img>
            <h1 className="header-title">Matrix</h1>
        </div>
    </>
}

