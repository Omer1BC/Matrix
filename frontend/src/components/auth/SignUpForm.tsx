"use client";

import { signUp } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signUp(email, password, username, firstname, lastname);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-primary/90 font-medium text-sm">
            First name
          </label>
          <input
            type="text"
            autoComplete="given-name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
            placeholder="John"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-primary/90 font-medium text-sm">
            Last name
          </label>
          <input
            type="text"
            autoComplete="family-name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-primary/90 font-medium text-sm">Username</label>
        <input
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          placeholder="Choose a username"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary/90 font-medium text-sm">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          placeholder="your.email@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary/90 font-medium text-sm">Password</label>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          placeholder="Create a strong password"
          required
        />
      </div>

      <Button
        disabled={loading}
        type="submit"
        className="w-full glow-text hover:shadow-lg hover:shadow-primary/30 transition-all"
        style={{ cursor: "pointer" }}
        variant={undefined}
        size={undefined}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
}
