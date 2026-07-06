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

  const teamMembers = teamData?.data?.items || [];
  const invitations = invitesData?.data?.items || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-gray-500 mt-1">Manage your team members and invitations</p>
        </div>
        <InviteMemberDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {teamLoading ? (
            <div className="py-8 text-center text-gray-500">Loading team members...</div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No team members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell className="font-medium">{member.displayName || "N/A"}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell className="capitalize">{member.role.replace("_", " ")}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === "active" ? "secondary" : "default"}>
                            {member.status}
                          </Badge>
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
            <div className="py-8 text-center text-gray-500">Loading invitations...</div>
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
                      <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
