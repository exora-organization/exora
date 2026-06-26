"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInformation } from "@/components/profile/ProfileInformation";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { UserProfile } from "@/lib/types/user";
import { Separator } from "@/components/ui/separator";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  if (!profile) return null;
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
