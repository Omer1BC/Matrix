"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Target, Trophy, Brain, LogOut, LogIn, UserPlus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/usercontext";
import Link from "next/link";
import Image from "next/image";

export default function MatrixLanding() {
  const { user, setUser } = useContext(UserContext);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");

  useEffect(() => {
    if (user) {
      window.location.href = "/learn";
    }
  }, [user]);

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
      setShowLogin(false);
    } catch (err) {
      console.log("Login error: ", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
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
        data = text;
      }
      console.log("Signup response:", data);
      setUser(data.user[0]);
      setShowSignup(false);
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setUser(null);
        console.log("Logged out successfully");
        window.location.href = "/homepage";
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="matrix-rain" />

      {/* Login Popup */}
      {showLogin && (
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
                <Button type="submit" className="flex-1 glow-text">
                  Log In
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogin(false)}
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
      {showSignup && (
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
                <Button type="submit" className="flex-1 glow-text">
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
          <Link href="/homepage" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/matrix_logo.png" alt="Matrix Logo" className="w-10 h-10" />
            <span className="text-xl font-bold glow-text">Matrix</span>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-lg text-primary glow-text">
                Hello {user.first_name}!
              </span>
              <Button 
                variant="outline" 
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={() => setShowLogin(true)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
              <Button 
                className="glow-text"
                onClick={() => setShowSignup(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            The Future of Coding Practice
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 glow-text text-balance">
            Welcome to the <span className="text-primary">MATRIX</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-pretty text-primary">
            Enter a new dimension of coding practice. Matrix is an all-in-one interview prep tool
            with an immersive, AI-powered platform that adapts to your learning style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="text-lg px-8 py-6 glow-text">
                Watch Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">Why Choose Matrix?</h2>
            <p className="text-xl max-w-2xl mx-auto text-pretty text-primary">
              Experience coding practice like never before with our revolutionary platform features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">AI-Powered Learning</CardTitle>
                <CardDescription>
                  Advanced AI analyzes your coding patterns and creates personalized learning paths.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">Real-time Feedback</CardTitle>
                <CardDescription>
                  Get instant feedback on your code quality, performance, and best practices as you type.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">Lesson Plan</CardTitle>
                <CardDescription>
                  Follow our custom exercises to learn all of the skills you need to succeed in coding questions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm matrix-border hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 aspect-square flex flex-col h-full">
              <CardHeader className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-primary mb-2">Interview Prep</CardTitle>
                <CardDescription>
                  Simulate real technical interviews with AI interviewers and get detailed performance analytics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Active Developers</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Coding Problems</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">X</div>
              <div className="text-muted-foreground">Lessons</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary glow-text">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}