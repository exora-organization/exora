"use client";

import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { apiOwner } from "../../../lib/api/owner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useState, useEffect } from "react";
import { Building, MapPin, Briefcase, Hash, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

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
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#00A651]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl font-bold max-w-lg mx-auto mt-10 shadow-lg border border-red-100 flex flex-col items-center gap-4">
        <p>Failed to load company profile.</p>
        <div className="bg-white/80 p-4 text-left text-xs overflow-auto rounded-xl border border-red-200 w-full font-mono">
          <span className="text-red-400 font-bold uppercase">Debug Info:</span>
          <br/>companyId: {String(companyId)}
          <br/>error: {String(error)}
        </div>
        <Button onClick={() => refetch()} variant="destructive" className="rounded-xl font-bold">Retry</Button>
      </div>
    );
  }

  const company = data.data;

  const handleSave = () => {
    // Implement API call here when backend is ready
    // apiCompany.updateCompany(companyId, formData)
    setIsEditing(false);
    toast.success("Changes saved locally (Backend update not yet available)");
  };

  return (
    <div className="space-y-10 text-[#1F2937] relative pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Company Profile</h2>
          <p className="text-sm text-[#4B5563] font-medium mt-1">Manage your organization details</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1.5 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-[#E8E3D9]">
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${company?.status === 'active' ? 'bg-[#EBF8F2] text-[#00A651]' : 'bg-amber-50 text-amber-600'}`}>
            {company?.status?.replace("_", " ") || "ACTIVE"}
          </span>
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest font-mono">ID: {companyId || "null"}</span>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EBF8F2] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-[#00A651] rounded-full inline-block"></span>
            Business Information
          </h3>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline"
              className="rounded-2xl border-[#00A651] text-[#00A651] hover:bg-[#EBF8F2] hover:text-[#00A651] font-bold h-12 px-6 shadow-sm group/btn"
            >
              <Edit2 className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="outline"
                className="rounded-2xl border-gray-300 text-gray-700 hover:bg-gray-50 font-bold h-12 px-6 shadow-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                className="rounded-2xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold h-12 px-8 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Check className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          
          {/* Company Name */}
          <div className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Building className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Company Name</p>
              {isEditing ? (
                <Input 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  className="font-extrabold text-lg rounded-xl border-[#00A651]/50 focus-visible:ring-[#00A651] shadow-sm h-12"
                />
              ) : (
                <p className="text-2xl font-black text-[#1F2937]">{company?.companyName}</p>
              )}
            </div>
          </div>

          {/* Business Sector */}
          <div className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
            <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Briefcase className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Business Sector</p>
              {isEditing ? (
                <Input 
                  value={formData.businessSector}
                  onChange={(e) => setFormData({...formData, businessSector: e.target.value})}
                  className="font-bold text-lg rounded-xl border-[#00A651]/50 focus-visible:ring-[#00A651] shadow-sm h-12"
                />
              ) : (
                <p className="text-xl font-bold text-[#1F2937]">{company?.businessSector}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
            <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <MapPin className="w-7 h-7 text-[#00A651]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Country</p>
              {isEditing ? (
                <Input 
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="font-bold text-lg rounded-xl border-[#00A651]/50 focus-visible:ring-[#00A651] shadow-sm h-12"
                />
              ) : (
                <p className="text-xl font-bold text-[#1F2937]">{company?.country}</p>
              )}
            </div>
          </div>

          {/* Company ID */}
          <div className="flex gap-4 p-5 rounded-2xl bg-[#FAF8F3]/50 border border-[#E8E3D9] hover:shadow-md transition-all group/item">
            <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
              <Hash className="w-7 h-7 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1.5">Company ID (Immutable)</p>
              <p className="text-lg font-bold text-[#4B5563] font-mono bg-white/60 px-3 py-1.5 rounded-xl border border-[#E8E3D9] inline-block">{company?.companyId}</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
