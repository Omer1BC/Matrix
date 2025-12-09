"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { PasswordState } from "@/lib/types/types";
import React from "react";

type Props = {
  password: PasswordState;
  onChange: (next: PasswordState) => void;
};

export function ProfileCredentialsCard({ password, onChange }: Props) {
  return (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...password, current: e.target.value })
              }
              className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
              placeholder="Enter current password"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm text-primary/90">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={password.new}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...password, new: e.target.value })
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...password, confirm: e.target.value })
                }
                className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
