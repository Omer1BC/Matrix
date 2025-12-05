"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { signIn, signOut, randomSignUp } from "@/lib/supabase/auth";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuth();
  /**
   * This is the randomized sign up for the class demo
   * @param e event
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // console.log(await randomSignUp());
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      setShowLogin(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <header className="flex flex-row justify-between w-full relative z-10 border-b border-border/20 backdrop-blur-sm bg-background/80">
        <div className="px-4 py-4 flex flex-1 items-center justify-between">
          <div className="flex flex-row gap-4 items-center text-[var(--gr-2)]">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Image
                src="/matrix_logo.png"
                alt="Matrix Logo"
                className="matrix-header w-10 h-10"
                width={100}
                height={100}
              />
              <span className="text-xl font-bold glow-text">Matrix</span>
            </Link>
            {user ? (
              <div className="flex flex-row gap-4 items-center">
                <Link
                  href={"/learn"}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <span className="text-xl font-bold glow-text">Learn</span>
                </Link>
                <Link
                  href={"/solve"}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <span className="text-xl font-bold glow-text">Solve</span>{" "}
                </Link>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {authLoading ? (
            <div className="flex items-center gap-4">
              <span className="invisible text-lg">Hello placeholder</span>
              <div className="invisible">
                <Button
                  variant="outline"
                  size={undefined}
                  className="matrix-border bg-transparent hover:bg-primary/10"
                >
                  Log out
                </Button>
              </div>
              <div className="invisible">
                <Image src="/userPhoto.png" alt="" width={50} height={50} />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-lg text-primary glow-text">
                Hello{" "}
                {user.user_metadata?.first_name || user.user_metadata?.email}!
              </span>
              <Button
                variant="outline"
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={handleLogout}
                style={{ cursor: "pointer" }}
                size={undefined}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
              <button
                onClick={() => (window.location.href = "/settings")}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src="/userPhoto.png"
                  alt="user photo"
                  width={50}
                  height={50}
                />
              </button>
            </div>
          ) : (
            <div className="signup flex items-center gap-3">
              <Button
                variant="outline"
                className="matrix-border bg-transparent hover:bg-primary/10"
                onClick={() => setShowLogin(true)}
                style={{ cursor: "pointer" }}
                size={undefined}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
              <Button
                className="glow-text"
                onClick={handleSignup}
                style={{ cursor: "pointer" }}
                variant={undefined}
                size={undefined}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border-2 matrix-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-bold mb-6 glow-text text-center">
              Log In
            </h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <Button
                  disabled={loading}
                  type="submit"
                  className="flex-1 glow-text"
                  style={{ cursor: "pointer" }}
                  variant={undefined}
                  size={undefined}
                >
                  {loading ? "Logging in..." : "Log In"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 matrix-border"
                  style={{ cursor: "pointer" }}
                  size={undefined}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border-2 matrix-border rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-bold mb-6 glow-text text-center">
              Sign Up
            </h2>
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
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <Button
                  disabled={loading}
                  type="submit"
                  className="flex-1 glow-text"
                  style={{ cursor: "pointer" }}
                  variant={undefined}
                  size={undefined}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignup(false)}
                  className="flex-1 matrix-border"
                  style={{ cursor: "pointer" }}
                  size={undefined}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
