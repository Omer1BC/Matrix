"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { signOut } from "@/lib/supabase/auth";
import { LogOut, LogIn, UserPlus, FileBadge2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
      <header className="flex flex-row justify-between w-full relative z-10 border-b border-border/20 backdrop-blur-sm bg-background/80 h-[80px]">
        <div className="px-4 flex flex-1 items-center justify-between">
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
                  <span className="text-xl font-bold glow-text">Solve</span>
                </Link>
              </div>
            ) : (
              <div></div>
            )}
          </div>

          <div className="flex items-center gap-3">
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
                <div className="invisible h-10 w-10">
                  <Image src="/user_photo.png" alt="" width={40} height={40} />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link href="/survey">
                  <Button
                    variant="outline"
                    className="matrix-border bg-transparent hover:bg-primary/10 text-muted-foreground"
                    style={{ cursor: "pointer" }}
                    size={undefined}
                  >
                    <FileBadge2 className="mr-2 h-4 w-4" />
                    Survey
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="matrix-border bg-transparent hover:bg-primary/10 text-muted-foreground"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                  size={undefined}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
                <button
                  onClick={() => {
                    router.push("/profile");
                  }}
                  className="flex items-center justify-center h-10 w-10"
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    src="/user_photo.png"
                    alt="user photo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </button>
              </div>
            ) : (
              <div className="signup flex items-center gap-3">
                <Button
                  variant="outline"
                  className="matrix-border bg-transparent hover:bg-primary/10 text-muted-foreground"
                  onClick={() => {}}
                  style={{ cursor: "pointer" }}
                  size={undefined}
                >
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Log in
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="matrix-border bg-transparent hover:bg-primary/10 text-muted-foreground"
                  style={{ cursor: "pointer" }}
                  size={undefined}
                >
                  <Link href="/sign-up" className="flex items-center gap-2">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
