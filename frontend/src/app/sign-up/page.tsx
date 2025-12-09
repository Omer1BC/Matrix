"use client";
import SignUpForm from "@/components/auth/SignUpForm";
import Link from "next/link";
import { useAuth } from "@/lib/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function SignUpPage() {
  const { user, loading } = useAuth();

  // Redirect logged-in users to homepage
  if (!loading && user) {
    redirect("/");
  }

  return (
    <main className="flex h-full items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-md">
        {/* Decorative top border */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-8 rounded-full shadow-lg shadow-primary/50" />

        <div className="matrix-border bg-card/30 backdrop-blur-sm rounded-lg p-8 md:p-10 shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold glow-text mb-2">
              Join the Matrix
            </h1>
            <p className="text-primary/70 text-sm">
              Create your account to begin
            </p>
          </div>

          <SignUpForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-foreground/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors glow-text"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
