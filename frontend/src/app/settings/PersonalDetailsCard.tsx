"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User as UserIcon } from "lucide-react";
import { ProfileState } from "@/lib/types";
import React from "react";

type Props = {
  profileState: ProfileState;
  onChange: (next: ProfileState) => void;
};

export function ProfileDetailsCard({ profileState, onChange }: Props) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Profile Information
        </h2>
        <p className="text-primary">
          Manage your personal details and account settings
        </p>
      </div>

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
              <Label htmlFor="firstName" className="text-sm text-primary/90">
                First Name
              </Label>
              <Input
                id="firstName"
                name="given-name"
                autoComplete="given-name"
                type="text"
                value={profileState.firstName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...profileState, firstName: e.target.value })
                }
                className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                placeholder="Enter first name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm text-primary/90">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="family-name"
                autoComplete="family-name"
                type="text"
                value={profileState.lastName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onChange({ ...profileState, lastName: e.target.value })
                }
                className="border-primary/30 bg-input text-foreground placeholder:text-primary/40 focus:border-primary focus:ring-primary/20"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label htmlFor="email" className="text-sm text-primary/90">
                Email Address
              </Label>
            </div>
            <Input
              id="email"
              name="email"
              autoComplete="email"
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
    </>
  );
}
