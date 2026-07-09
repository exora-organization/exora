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

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { firebaseUser, loading: authLoading } = useUserProfile();

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
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string, role: string }) => 
      apiUsers.changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiUsers.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Failed to load users</div>;

  const users = data?.data?.items || [];
  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-gray-500 mt-1">Manage platform users, roles, and access.</p>
      </div>

      <div className="flex justify-between items-center">
        <Input 
          placeholder="Search users by name or email..." 
          className="max-w-md" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-12 px-6 font-extrabold text-slate-700 tracking-wider text-xs uppercase">User</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-slate-700 tracking-wider text-xs uppercase">Company ID</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-slate-700 tracking-wider text-xs uppercase">Role</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-slate-700 tracking-wider text-xs uppercase">Status</TableHead>
              <TableHead className="h-12 px-6 font-extrabold text-slate-700 tracking-wider text-xs uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="font-bold text-slate-800">{user.displayName || "Unknown User"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-600">
                    {user.companyId || "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge variant="outline" className="font-bold bg-white text-slate-600 border-slate-300 tracking-wide">
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
                          if (confirm(`Change role to ${newRole}?`)) {
                            changeRoleMutation.mutate({ userId: user.userId, role: newRole });
                          }
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
                          if (confirm(`Change status to ${newStatus}?`)) {
                            updateStatusMutation.mutate({ userId: user.userId, status: newStatus });
                          }
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
                          if (confirm("Are you sure you want to delete this user? This cannot be undone.")) {
                            deleteUserMutation.mutate(user.userId);
                          }
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
    </div>
  );
}
