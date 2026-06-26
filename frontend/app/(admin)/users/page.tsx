"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { apiUsers } from "../../../lib/api/users";
import { UserProfile } from "../../../lib/types/user";

export default function UserManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiUsers.listUsers(),
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

      <div className="grid gap-4">
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 py-8">No users found.</p>
        )}
        {filteredUsers.map((user) => (
          <Card key={user.userId}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h3 className="font-semibold text-lg">{user.displayName || "Unknown User"}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                {user.companyId && (
                  <div>
                    <p className="text-sm text-gray-500">Company ID</p>
                    <p className="font-medium text-xs">{user.companyId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <Badge variant="outline">{user.role?.replace("_", " ")}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={user.status === "active" ? "default" : "destructive"}>
                    {user.status || "active"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
