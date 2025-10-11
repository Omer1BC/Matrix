"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Mail,
  Lock,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import {
  updateUserProfile,
  updatePassword,
  getUserProfile,
} from "@/lib/supabase/auth";
import { PasswordState, ProfileState, ProfileUpdate } from "@/lib/types";

export default function SettingsPage() {
  const { user, authLoading } = useAuth();

  const [profileState, setProfileState] = useState<ProfileState>({
    firstName: "",
    lastName: "",
    learningStyle: "",
    email: "",
  });

  const [password, setPassword] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });

  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user) {
        setInitializing(false);
        return;
      }
      try {
        const user = await getUserProfile();
        if (!alive) return;

        setProfileState({
          firstName: user?.first_name ?? "",
          lastName: user?.last_name ?? "",
          learningStyle: user?.learning_style ?? "",
          email: user?.email ?? "",
        });
      } catch (e) {}
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const disabledSave = useMemo(
    () => saving || authLoading || initializing,
    [saving, authLoading, initializing]
  );

  if (authLoading || initializing) return null;
  if (!user) return null;

  const handleSave = async () => {
    try {
      setSaving(true);

      const patch: ProfileUpdate = {
        firstName: profileState.firstName || null,
        lastName: profileState.lastName || null,
        learningStyle: profileState.learningStyle || null,
      };

      await updateUserProfile(patch);

      if (password.new || password.confirm) {
        if (password.new !== password.confirm) {
          alert("New password and confirmation must match.");
        } else {
          await updatePassword(password.new);
          setPassword({ current: "", new: "", confirm: "" });
        }
      }

      alert("Changes to profile saved.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {user && (
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
            <div className="container mx-auto flex items-center justify-between px-4 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-mono text-sm">Back to Home</span>
              </Link>
              <h1 className="glow-text font-mono text-xl font-bold text-primary">
                Account Settings
              </h1>
              <div className="w-24" /> {/* Spacer for centering */}
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto max-w-4xl px-4 py-12">
            <div className="space-y-8">
              {/* Profile Information section */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  Profile Information
                </h2>
                <p className="text-primary">
                  Manage your personal details and account settings
                </p>
              </div>

              {/* Profile Details */}
              <Card className="matrix-border bg-card/40 p-6 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-semibold text-foreground">
                      Personal Details
                    </Label>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-sm text-primary/90"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={profileState.firstName}
                        onChange={(e: any) =>
                          setProfileState({
                            ...profileState,
                            firstName: e.target.value,
                          })
                        }
                        className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter first name"
                        type={undefined}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-sm text-primary/90"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={profileState.lastName}
                        onChange={(e: any) =>
                          setProfileState({
                            ...profileState,
                            lastName: e.target.value,
                          })
                        }
                        className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter last name"
                        type={undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label
                        htmlFor="email"
                        className="text-sm text-primary/90"
                      >
                        Email Address
                      </Label>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={profileState.email}
                      disabled
                      className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20 opacity-80"
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-primary/60">
                      Email can’t be changed here.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Security Settings */}
              <Card className="matrix-border bg-card/40 p-6 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-semibold text-foreground">
                      Change Password
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-sm text-primary/90"
                      >
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={password.current}
                        onChange={(e: any) =>
                          setPassword({ ...password, current: e.target.value })
                        }
                        className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="newPassword"
                          className="text-sm text-primary/90"
                        >
                          New Password
                        </Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={password.new}
                          onChange={(e: any) =>
                            setPassword({ ...password, new: e.target.value })
                          }
                          className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm text-primary/90"
                        >
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={password.confirm}
                          onChange={(e: any) =>
                            setPassword({
                              ...password,
                              confirm: e.target.value,
                            })
                          }
                          className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Separator className="bg-primary/20" />

              {/* Page Title */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  Learning Preferences
                </h2>
                <p className="text-primary">
                  Describe how you learn best so the AI can personalize your
                  guidance
                </p>
              </div>

              <Card className="matrix-border bg-card/40 p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-semibold text-foreground">
                      Your Learning Style
                    </Label>
                  </div>

                  <p className="text-sm text-primary/70">
                    Tell us about your learning preferences, strengths, and how
                    you like to approach problem-solving. The AI will use this
                    information to provide personalized guidance when you work
                    on LeetCode problems.
                  </p>

                  <div className="space-y-2">
                    <Textarea
                      id="learningPreferences"
                      value={profileState.learningStyle}
                      onChange={(e: any) =>
                        setProfileState({
                          ...profileState,
                          learningStyle: e.target.value,
                        })
                      }
                      placeholder="Example: I'm a visual learner who prefers to see diagrams and flowcharts. I like to understand the theory behind algorithms before diving into code. I learn best with step-by-step explanations and multiple examples. I prefer hints over direct solutions so I can figure things out myself..."
                      className="min-h-[200px] resize-y border-primary/30 bg-input text-foreground placeholder:text-primary/30 focus:border-primary focus:ring-primary/20"
                    />
                    <p className="text-xs text-primary/50">
                      Be as detailed as you&apos;d like. Include your preferred
                      learning methods, what helps you understand concepts best,
                      and any specific approaches that work well for you.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={disabledSave}
                  size="default"
                  className="glow-text border-2 border-primary bg-primary font-mono text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(102,255,102,0.5)]"
                  variant={undefined}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
