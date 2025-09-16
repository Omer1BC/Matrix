"use client";

import Header from '../templates/header/header';
import Link from 'next/link'


const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "shoaib0130@yahoo.com",
          password: "secret123"
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text; // fallback to raw text
      }
      console.log("Signup response:", data);
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

export default function Homepage() {
    return(
        <div>
            <Header />
            <p>Welcome to the homepage</p>
            <button onClick={handleSignup}>Signup</button>
        </div>
    )
}