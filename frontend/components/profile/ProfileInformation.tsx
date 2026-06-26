"use client";

import { UserProfile } from "../../lib/types/user";

interface ProfileInformationProps {
  profile: UserProfile;
}

export function ProfileInformation({ profile }: ProfileInformationProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const capitalize = (s?: string | null) => {
    if (!s) return "Not Available";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const infoList = [
    { label: "Account Status", value: capitalize(profile.status) },
    { label: "Company Status", value: capitalize(profile.companyStatus) },
    { label: "Company ID", value: profile.companyId || "Not Available" },
    { label: "Member Since", value: formatDate(profile.createdAt) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {infoList.map((item, index) => (
        <div key={index} className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{item.label}</p>
          <p className="text-base text-gray-900 font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
