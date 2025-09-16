import { useState } from "react"
import "./header.css"

import Link from 'next/link'

export default function Header () {
    return <>
        <div className="header-div">
            <div className="logo-title">
                <Link href="/homepage" className="logo-title">
                    <img className="imgg-icon" src={"matrix_logo.png"}></img>
                    <h1 className="header-title">Matrix</h1>
                </Link>
            </div>
        </div>
    </>
}

