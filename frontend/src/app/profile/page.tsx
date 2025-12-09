"use client";

import { useEffect, useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  updateUserProfile,
  updatePassword,
  getUserProfile,
} from "@/lib/supabase/auth";
import { PasswordState, ProfileState, ProfileUpdate } from "@/lib/types/types";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { ProfileDetailsCard } from "@/components/profile/ProfileDetailsCard";
import { ProfileCredentialsCard } from "@/components/profile/ProfileCredentialsCard";
import { ProfilePreferencesCard } from "@/components/profile/ProfilePreferencesCard";
import { ProfileSaveButton } from "@/components/profile/ProfileSaveButton";

export default function SettingsPage() {
  const { user, loading } = useAuth();

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
        const profile = await getUserProfile();
        if (!alive) return;

        setProfileState({
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
          learningStyle: profile?.learning_style ?? "",
          email: profile?.email ?? "",
        });
      } catch (e) {
        console.error("Error setting profile: ", e);
      } finally {
        if (alive) setInitializing(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

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
          toast.error("New password and confirmation must match.");
        } else {
          await updatePassword(password.new);
          setPassword({ current: "", new: "", confirm: "" });
        }
      }

      toast.success("Changes to profile saved.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const disabledSave = useMemo(
    () => saving || loading || initializing,
    [saving, loading, initializing]
  );

  if (!loading && !initializing && !user) {
    redirect("/");
  }

  return (
    <main className="flex flex-col h-full bg-background text-foreground px-12 py-12 space-y-8 overflow-y-auto custom-scroll">
      <ProfileDetailsCard
        profileState={profileState}
        onChange={setProfileState}
      />

      <ProfileCredentialsCard password={password} onChange={setPassword} />

      <Separator className="bg-primary/20" />

      <ProfilePreferencesCard
        learningStyle={profileState.learningStyle}
        onChange={(value) =>
          setProfileState((s) => ({ ...s, learningStyle: value }))
        }
      />

      <ProfileSaveButton
        saving={saving}
        disabled={disabledSave}
        onSave={handleSave}
      />
    </main>
  );
}
