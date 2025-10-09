"use client";

import { useState, useContext, useEffect } from "react";
import "./header.css";
import { UserContext } from "../../contexts/usercontext";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Target, Trophy, Brain, LogOut, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import userPhoto from '../../../../public/userphoto.png'

export default function Header() {
  const [login, setLogin] = useState(false);
  const [signup, setSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  const { user, setUser } = useContext(UserContext);

  const toggleLogin = () => {
    setLogin(!login);
  };

  const toggleSignup = () => {
    setSignup(!signup);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log(firstname);
    console.log(lastname);
    console.log(username);
    console.log(password);

    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
          firstname: firstname,
          lastname: lastname,
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
      setUser(data.user[0]);
    } catch (err) {
      console.error("Signup failed:", err);
    }
    setSignup(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // clear user from context so UI updates
        console.log("Logged out successfully");
      }
      setUser(null);
      window.location.href = "/home";
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/supabase_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      setUser(data.user[0]);
    } catch (err) {
      console.log("Login error: ", err);
    }
    setLogin(false)
  };

  return (
    <>
      {/* Login Popup */}
      {login && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border-2 matrix-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-bold mb-6 glow-text text-center">Log In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 glow-text" style={{cursor: "pointer"}}>
                  Log In
                </Button>
                <Button
                  style={{cursor: "pointer"}}
                  type="button"
                  variant="outline"
                  onClick={() => setLogin(false)}
                  className="flex-1 matrix-border"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Signup Popup */}
      {signup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border-2 matrix-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-bold mb-6 glow-text text-center">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="email"
                placeholder="Enter email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 glow-text" style={{cursor: "pointer"}}>
                  Sign Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignup(false)}
                  className="flex-1 matrix-border"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-border/20 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/matrix_logo.png" alt="Matrix Logo" className="w-10 h-10" />
            <span className="text-xl font-bold glow-text">Matrix</span>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-lg text-primary glow-text">
                Hello {user.first_name}!
              </span>
              <Button 
                style={{cursor: "pointer"}}
                variant="outline" 
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              <button onClick={() => (window.location.href = "/settings")}
                style={{cursor: "pointer"}}>
                <Image src={userPhoto} alt="user photo" width={50}/>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                style={{cursor: "pointer"}}
                variant="outline" 
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={() => setLogin(true)}
              >
                <LogIn className="mr-2 h-4 w-4"/>
                Log in
              </Button>
              <Button
                style={{cursor: "pointer"}} 
                className="glow-text"
                onClick={() => setSignup(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
