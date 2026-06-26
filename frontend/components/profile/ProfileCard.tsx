"use client";

import { Card, CardContent } from "../ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInformation } from "./ProfileInformation";
import { ProfileActions } from "./ProfileActions";
import { UserProfile } from "../../lib/types/user";
import { Separator } from "../ui/separator";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md">
      <CardContent className="p-0">
        <ProfileHeader 
          displayName={profile.displayName} 
          email={profile.email} 
          role={profile.role} 
        />
        <Separator />
        <div className="p-6 space-y-6">
          <ProfileInformation profile={profile} />
          <Separator />
          <ProfileActions email={profile.email} />
        </div>
      </CardContent>
    </Card>
  );
}
