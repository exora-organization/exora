"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { apiUsers } from "../../../lib/api/users";
import { UserProfile } from "../../../lib/types/user";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { ConfirmWarningDialog } from "../../../components/ui/confirm-warning-dialog";
import { Search } from "lucide-react";

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
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
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

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load users</div>;

  const users = data?.data?.items || [];
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const isMutationPending = updateStatusMutation.isPending || changeRoleMutation.isPending || deleteUserMutation.isPending;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
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
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-[#9CA3AF]" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="flex justify-center py-12 text-[#9CA3AF] font-bold">
            No users found.
          </div>
        ) : (
          filteredUsers.map((user) => (
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

              {/* Role */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Role</p>
                <span className="inline-flex items-center bg-[#EBF8F2] text-[#00A651] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize">
                  {user.role?.replace("_", " ")}
                </span>
              </div>

              {/* Status */}
              <div className="flex-1">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">Status</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide capitalize ${
                  user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`}></span>
                  {user.status === "active" ? "success" : "error"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 md:ml-4">
                <button 
                  onClick={() => {
                    const newRole = user.role === "export_manager" ? "finance_staff" : "export_manager";
                    setConfirmDialog({
                      isOpen: true,
                      title: "Change User Role",
                      description: `Are you sure you want to change the role of ${user.displayName || user.email} to ${newRole.replace("_", " ").toUpperCase()}?`,
                      actionLabel: "Change Role",
                      severity: "warning",
                      onConfirm: () => {
                        changeRoleMutation.mutate({ userId: user.userId, role: newRole });
                      }
                    });
                  }}
                  disabled={changeRoleMutation.isPending}
                  className="border-2 border-[#00A651] text-[#00A651] hover:bg-[#EBF8F2] px-4 py-2 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Change<br/>Role
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
                  className="text-[#4B5563] hover:text-[#1F2937] text-sm font-bold transition-colors disabled:opacity-50"
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
                  className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmWarningDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        actionLabel={confirmDialog.actionLabel}
        severity={confirmDialog.severity}
        confirmText={confirmDialog.confirmText}
        isLoading={isMutationPending}
      />
    </div>
  );
}
