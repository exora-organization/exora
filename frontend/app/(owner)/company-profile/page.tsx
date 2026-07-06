"use client";

import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { apiOwner } from "../../../lib/api/owner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useState, useEffect } from "react";

export default function CompanyProfilePage() {
  const { profile, companyId } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    businessSector: "",
    country: "",
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => apiOwner.getCompanyDetails(companyId as string),
    enabled: !!companyId,
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        companyName: data.data.companyName || "",
        businessSector: data.data.businessSector || "",
        country: data.data.country || "",
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <div className="text-xs text-gray-400">Loading... (companyId: {companyId || "empty"})</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Failed to load company profile.</p>
        <div className="bg-gray-100 p-4 text-left text-xs overflow-auto">
          DEBUG INFO:
          <br/>companyId: {String(companyId)}
          <br/>profile: {JSON.stringify(profile)}
          <br/>error: {String(error)}
        </div>
        <Button onClick={() => refetch()} variant="outline">Retry</Button>
      </div>
    );
  }

  const company = data.data;

  const handleSave = () => {
    // Implement API call here when backend is ready
    // apiCompany.updateCompany(companyId, formData)
    setIsEditing(false);
    alert("Changes saved locally (Backend update not yet available)");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Company Profile</h2>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="secondary" className="px-3 py-1">
            {company?.status?.toUpperCase() || "ACTIVE"}
          </Badge>
          <span className="text-xs text-gray-400">ID: {companyId || "null"}</span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Business Information</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit Company Information
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-500">Company ID</Label>
              <p className="font-medium text-sm font-mono mt-1">{company?.companyId}</p>
            </div>
            
            <div>
              <Label className="text-gray-500">Company Name</Label>
              {isEditing ? (
                <Input 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium text-lg mt-1">{company?.companyName}</p>
              )}
            </div>
            
            <div>
              <Label className="text-gray-500">Business Sector</Label>
              {isEditing ? (
                <Input 
                  value={formData.businessSector}
                  onChange={(e) => setFormData({...formData, businessSector: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">{company?.businessSector}</p>
              )}
            </div>
            
            <div>
              <Label className="text-gray-500">Country</Label>
              {isEditing ? (
                <Input 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1"
                />
              ) : (
                <p className="font-medium mt-1">{company?.country}</p>
              )}
            </div>
          </div>
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
