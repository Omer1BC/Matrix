"use client";
import { signIn } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-2">
        <label className="text-primary/90 font-medium text-sm">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-primary/90 font-medium text-sm">Password</label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-input/50 border border-primary/20 rounded-md text-foreground placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-50"
          placeholder="Enter your password"
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
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
}
