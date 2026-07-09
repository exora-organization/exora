"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiOwner } from "../../../lib/api/owner";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { InviteMemberDialog } from "../../../components/owner/InviteMemberDialog";

export default function TeamManagementPage() {
  const queryClient = useQueryClient();

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => apiOwner.getTeamMembers(),
  });

  const { data: invitesData, isLoading: invitesLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => apiOwner.getInvitations(),
  });

  const resendMutation = useMutation({
    mutationFn: (invitationId: string) => apiOwner.resendInvitation({ invitationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      alert("Invitation resent successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to resend invitation.");
    }
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => apiOwner.changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update role.");
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => apiOwner.updateMember(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update status.");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => apiOwner.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      alert("Member removed successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to remove member.");
    }
  });

  const handleRoleChange = (userId: string, role: string) => {
    roleMutation.mutate({ userId, role });
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    statusMutation.mutate({ userId, status: nextStatus });
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this team member? This action cannot be undone.")) {
      removeMutation.mutate(userId);
    }
  };

  const teamMembers = teamData?.data?.items || [];
  const invitations = invitesData?.data?.items || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-[#9CA3AF] mt-1">Manage your team members and invitations</p>
        </div>
        <InviteMemberDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="py-8 text-center text-[#9CA3AF]">Loading team members...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-[#9CA3AF]">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">{member.displayName || "N/A"}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.role === "company_owner" ? (
                            <span className="text-sm font-semibold text-[#4B5563] capitalize">Company Owner</span>
                          ) : (
                            <select
                              value={member.role}
                              disabled={roleMutation.isPending && roleMutation.variables?.userId === member.userId}
                              onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                              className="bg-transparent border border-[#E8E3D9] rounded px-2.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                            >
                              <option value="export_manager">Export Manager</option>
                              <option value="finance_staff">Finance Staff</option>
                            </select>
                          )}
                        </TableCell>
                        <TableCell>
                          {member.role === "company_owner" ? (
                            <Badge variant="secondary">{member.status}</Badge>
                          ) : (
                            <button
                              disabled={statusMutation.isPending && statusMutation.variables?.userId === member.userId}
                              onClick={() => handleStatusToggle(member.userId, member.status)}
                              className={`px-3 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                member.status === "active"
                                  ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                  : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 disabled:opacity-50"
                              }`}
                            >
                              {member.status}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {member.role !== "company_owner" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={removeMutation.isPending && removeMutation.variables === member.userId}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                              onClick={() => handleRemoveMember(member.userId)}
                            >
                              Remove
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitesLoading ? (
            <div className="py-8 text-center text-[#9CA3AF]">Loading invitations...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-[#9CA3AF]">
                        No pending invitations.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((inv) => (
                      <TableRow key={inv.invitationId}>
                        <TableCell>{inv.email}</TableCell>
                        <TableCell className="capitalize">{inv.role.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(inv.expiresAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={resendMutation.isPending && resendMutation.variables === inv.invitationId}
                            onClick={() => resendMutation.mutate(inv.invitationId)}
                          >
                            Resend
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
