"use client";

import Header from '../templates/header/header';
import Link from 'next/link'
import Typewriter from '../homepage/typewriter'
import './page.css';
import { useRef, useState, useEffect, useContext } from 'react';
import { UserContext } from "../contexts/usercontext";

export default function Homepage() {

  const { user, setUser } = useContext(UserContext);


  useEffect(() => {
    if (user) {
      window.location.href = "/learn";
    }
  })

  return(
    <div>
      <Header />
      <div className='main-content'>
        <Typewriter text="Welcome to Matrix!" delay={100} />
      </div>
    </div>
    )
}