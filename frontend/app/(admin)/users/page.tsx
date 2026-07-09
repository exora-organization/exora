"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { apiUsers } from "../../../lib/api/users";
import { UserProfile } from "../../../lib/types/user";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { ConfirmWarningDialog } from "../../../components/ui/confirm-warning-dialog";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-[#9CA3AF] mt-1">Manage platform users, roles, and access.</p>
      </div>

      <div className="flex justify-between items-center">
        <Input 
          placeholder="Search users by name or email..." 
          className="max-w-md" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-[#E8E3D9] rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#FAF8F3]/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">User</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Company ID</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Role</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase">Status</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-[#4B5563] tracking-wider text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#9CA3AF] font-medium">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-[#1F2937]">{user.displayName || "Unknown User"}</div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">{user.email}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-[#4B5563]">
                    {user.companyId || "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="font-bold bg-white text-[#4B5563] border-slate-300 tracking-wide">
                      {user.role?.replace("_", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant={user.status === "active" ? "default" : "destructive"} className="font-bold tracking-wide">
                      {user.status?.toUpperCase() || "ACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="font-bold text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          const newRole = user.role === "export_manager" ? "finance_staff" : "export_manager";
                          setConfirmDialog({
                            isOpen: true,
                            title: "Change User Role",
                            description: `Are you sure you want to change the role of ${user.displayName || user.email} to ${newRole.replace("_", " ").toUpperCase()}? This will update their permissions immediately.`,
                            actionLabel: "Change Role",
                            severity: "warning",
                            onConfirm: () => {
                              changeRoleMutation.mutate({ userId: user.userId, role: newRole });
                            }
                          });
                        }}
                        disabled={changeRoleMutation.isPending}
                      >
                        Change Role
                      </Button>
                      
                      <Button 
                        variant={user.status === "active" ? "destructive" : "default"} 
                        size="sm"
                        className="font-bold transition-colors"
                        onClick={() => {
                          const newStatus = user.status === "active" ? "disabled" : "active";
                          setConfirmDialog({
                            isOpen: true,
                            title: newStatus === "disabled" ? "Disable User Account" : "Enable User Account",
                            description: newStatus === "disabled"
                              ? `Are you sure you want to disable the account of ${user.displayName || user.email}? This will temporarily restrict their access to the EXORA portal immediately.`
                              : `Are you sure you want to restore access to the account of ${user.displayName || user.email}?`,
                            actionLabel: newStatus === "disabled" ? "Disable" : "Enable",
                            severity: newStatus === "disabled" ? "danger" : "info",
                            onConfirm: () => {
                              updateStatusMutation.mutate({ userId: user.userId, status: newStatus });
                            }
                          });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {user.status === "active" ? "Disable" : "Enable"}
                      </Button>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="font-bold hover:bg-red-700 transition-colors"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: "Permanently Delete User Profile",
                            description: `WARNING: You are about to permanently delete the profile of ${user.displayName || user.email} (${user.userId}). All access will be revoked, and this cannot be undone.`,
                            actionLabel: "Delete User",
                            severity: "danger",
                            confirmText: "DELETE",
                            onConfirm: () => {
                              deleteUserMutation.mutate(user.userId);
                            }
                          });
                        }}
                        disabled={deleteUserMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
