"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { apiUsers } from "../../../lib/api/users";
import { UserProfile } from "../../../lib/types/user";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { ConfirmWarningDialog } from "../../../components/ui/confirm-warning-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Icon } from "@iconify/react";

const ROLE_OPTIONS = [
  { value: "company_owner", label: "Company Owner", desc: "Executive overview, full team management & company settings", icon: "solar:buildings-bold-duotone", badgeClass: "bg-[#EBF8F2] text-[#00A651] border-[#00A651]/30" },
  { value: "export_manager", label: "Export Manager", desc: "Operational export case management, workflow & document handling", icon: "solar:case-minimalistic-bold-duotone", badgeClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "finance_staff", label: "Finance Staff", desc: "Financial costing workspace, feasibility reports & cost configs", icon: "solar:document-text-bold-duotone", badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { value: "admin", label: "System Admin", desc: "Global tenant verification, user access control & system monitoring", icon: "solar:shield-keyhole-bold-duotone", badgeClass: "bg-[#EBF8F2] text-[#00A651] border-[#00A651]/30" },
  { value: "guest", label: "Guest Applicant", desc: "Applicant portal access for new company registration", icon: "solar:user-bold-duotone", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
] as const;

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { firebaseUser, loading: authLoading } = useUserProfile();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    severity?: "info" | "warning" | "danger";
    confirmText?: string;
    confirmPlaceholder?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    user: UserProfile | null;
    selectedRole: string;
  }>({
    isOpen: false,
    user: null,
    selectedRole: "export_manager",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiUsers.listUsers(),
    enabled: !!firebaseUser && !authLoading,
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: "active" | "disabled" }) => 
      apiUsers.updateUser(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => 
      apiUsers.changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleModal(prev => ({ ...prev, isOpen: false }));
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiUsers.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  });

  const [sortBy, setSortBy] = useState<string>("name_asc");

  if (isLoading) return <div className="p-8 text-center font-bold text-[#1F2937]">Loading users...</div>;
  if (error) return <div className="p-8 text-center font-bold text-red-500">Failed to load users</div>;

  const users = data?.data?.items || [];
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return (a.displayName || "").localeCompare(b.displayName || "");
      case "name_desc":
        return (b.displayName || "").localeCompare(a.displayName || "");
      case "email_asc":
        return a.email.localeCompare(b.email);
      case "date_newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "date_oldest":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  const isMutationPending = updateStatusMutation.isPending || changeRoleMutation.isPending || deleteUserMutation.isPending;

  const openRoleModal = (user: UserProfile) => {
    setRoleModal({
      isOpen: true,
      user,
      selectedRole: user.role || "export_manager",
    });
  };

  const handleProceedRoleChange = () => {
    if (!roleModal.user) return;
    const targetUser = roleModal.user;
    const targetRole = roleModal.selectedRole;
    const oldRoleLabel = (targetUser.role || "guest").replace("_", " ").toUpperCase();
    const newRoleLabel = targetRole.replace("_", " ").toUpperCase();

    setRoleModal(prev => ({ ...prev, isOpen: false }));

    setConfirmDialog({
      isOpen: true,
      title: "Confirm Role Change",
      description: `Are you sure you want to change the role of ${targetUser.displayName || targetUser.email} from ${oldRoleLabel} to ${newRoleLabel}? This will immediately update their platform access permissions.`,
      actionLabel: "Apply Role Change",
      severity: "warning",
      confirmText: "CONFIRM",
      confirmPlaceholder: "Type CONFIRM to authorize role change",
      onConfirm: () => {
        changeRoleMutation.mutate({ userId: targetUser.userId, role: targetRole });
      }
    });
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10 text-[#1F2937]">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">User Management</h2>
        <p className="text-[#4B5563] mt-2 font-medium">Manage platform users, roles, and access permissions.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full max-w-lg">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-white/60 shadow-md focus:outline-none focus:ring-2 focus:ring-[#00A651] bg-white/90 backdrop-blur-md text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Icon icon="solar:magnifer-bold-duotone" className="absolute right-4 top-3.5 h-5 w-5 text-[#9CA3AF]" />
        </div>

        <div className="flex gap-4 items-center w-full md:w-auto">
          <label className="text-sm font-bold text-[#4B5563] whitespace-nowrap">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-white/60 shadow-md bg-white/90 backdrop-blur-md text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651] cursor-pointer"
          >
            <option value="name_asc">Name (A - Z)</option>
            <option value="name_desc">Name (Z - A)</option>
            <option value="email_asc">Email (A - Z)</option>
            <option value="date_newest">Newest Joined</option>
            <option value="date_oldest">Oldest Joined</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedUsers.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
            No users found.
          </div>
        ) : (
          sortedUsers.map((user) => (
            <div key={user.userId} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all gap-6">
              
              {/* Profile Info */}
              <div className="flex-[2] min-w-[200px]">
                <h4 className="text-xl font-extrabold text-[#1F2937]">{user.displayName || "Unknown User"}</h4>
                <p className="text-sm font-semibold text-[#4B5563] mt-1">{user.email}</p>
              </div>

              {/* Company ID */}
              <div className="flex-1 hidden md:block">
                {user.companyId && (
                  <>
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Company ID</p>
                    <p className="text-xs font-bold text-[#4B5563] font-mono bg-gray-50 px-2 py-1 rounded inline-block">{user.companyId}</p>
                  </>
                )}
              </div>

              {/* Static Role Badge */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Role</p>
                <span className="inline-flex items-center bg-[#EBF8F2] text-[#00A651] border border-[#00A651]/30 px-3.5 py-1 rounded-full text-xs font-black tracking-wide capitalize">
                  {user.role?.replace("_", " ") || "guest"}
                </span>
              </div>

              {/* Status */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
                  user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`}></span>
                  {user.status === "active" ? "Active" : "Disabled"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 md:ml-4">
                <button 
                  onClick={() => openRoleModal(user)}
                  disabled={changeRoleMutation.isPending}
                  className="border-2 border-[#00A651] text-[#00A651] hover:bg-[#00A651] hover:text-white px-4 py-2 rounded-2xl text-xs font-extrabold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  Change Role
                </button>
                
                <button 
                  onClick={() => {
                    const newStatus = user.status === "active" ? "disabled" : "active";
                    setConfirmDialog({
                      isOpen: true,
                      title: newStatus === "disabled" ? "Disable User Account" : "Enable User Account",
                      description: newStatus === "disabled"
                        ? `Are you sure you want to disable the account of ${user.displayName || user.email}?`
                        : `Are you sure you want to restore access to the account of ${user.displayName || user.email}?`,
                      actionLabel: newStatus === "disabled" ? "Disable" : "Enable",
                      severity: newStatus === "disabled" ? "danger" : "info",
                      onConfirm: () => {
                        updateStatusMutation.mutate({ userId: user.userId, status: newStatus });
                      }
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="text-[#4B5563] hover:text-[#1F2937] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {user.status === "active" ? "Disable" : "Enable"}
                </button>
                
                <button 
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: "Permanently Delete User Profile",
                      description: `WARNING: You are about to permanently delete the profile of ${user.displayName || user.email} (${user.userId}).`,
                      actionLabel: "Delete User",
                      severity: "danger",
                      confirmText: "DELETE",
                      onConfirm: () => {
                        deleteUserMutation.mutate(user.userId);
                      }
                    });
                  }}
                  disabled={deleteUserMutation.isPending}
                  className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Selection Modal Dialog */}
      <Dialog open={roleModal.isOpen} onOpenChange={(open) => setRoleModal(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-lg max-w-[95%] border border-[#E8E3D9] shadow-2xl rounded-3xl p-6 bg-white/95 backdrop-blur-xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-keyhole-bold-duotone" className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-[#1F2937]">Select New Role</DialogTitle>
                <DialogDescription className="text-xs font-semibold text-gray-500">
                  Select a new role for <span className="font-bold text-[#1F2937]">{roleModal.user?.displayName || roleModal.user?.email}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 my-4 max-h-[340px] overflow-y-auto pr-1">
            {ROLE_OPTIONS.map((opt) => {
              const isSelected = roleModal.selectedRole === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setRoleModal(prev => ({ ...prev, selectedRole: opt.value }))}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "border-[#00A651] bg-[#EBF8F2]/60 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? "bg-[#00A651] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon icon={opt.icon} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#1F2937]">{opt.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${opt.badgeClass}`}>
                        {opt.value.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5 leading-snug">{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              className="font-bold border-[#E8E3D9] rounded-xl text-xs cursor-pointer"
              onClick={() => setRoleModal(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              disabled={!roleModal.user || roleModal.selectedRole === roleModal.user.role}
              onClick={handleProceedRoleChange}
              className="bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold rounded-xl text-xs px-6 shadow-md cursor-pointer disabled:opacity-50"
            >
              Proceed to Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Required Typed Confirmation Warning Dialog */}
      <ConfirmWarningDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        actionLabel={confirmDialog.actionLabel}
        severity={confirmDialog.severity}
        confirmText={confirmDialog.confirmText}
        confirmPlaceholder={confirmDialog.confirmPlaceholder}
        isLoading={isMutationPending}
      />
    </div>
  );
}


