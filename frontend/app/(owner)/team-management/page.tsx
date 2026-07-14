"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiOwner } from "../../../lib/api/owner";
import { InviteMemberDialog } from "../../../components/owner/InviteMemberDialog";
import { ConfirmWarningDialog } from "../../../components/ui/confirm-warning-dialog";
import { ShieldAlert, Mail, UserX, Clock, RefreshCw, Send, Users, Activity } from "lucide-react";
import { toast } from "sonner";

export default function TeamManagementPage() {
  const queryClient = useQueryClient();

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
      toast.success("Invitation resent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend invitation.");
    }
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => apiOwner.changeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update role.");
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => apiOwner.updateMember(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update status.");
    }
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => apiOwner.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      toast.success("Member removed successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to remove member.");
    }
  });

  const handleRoleChange = (userId: string, name: string, role: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Change Team Role",
      description: `Are you sure you want to change the role of ${name} to ${role.replace("_", " ").toUpperCase()}? This will alter their read/write permissions for costing and financial records immediately.`,
      actionLabel: "Change Role",
      severity: "warning",
      onConfirm: () => {
        roleMutation.mutate({ userId, role });
      }
    });
  };

  const handleStatusToggle = (userId: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active";
    setConfirmDialog({
      isOpen: true,
      title: nextStatus === "disabled" ? "Disable Member Access" : "Enable Member Access",
      description: nextStatus === "disabled"
        ? `Are you sure you want to disable access for ${name}? They will immediately lose access to the portal until reactivated.`
        : `Are you sure you want to restore access for ${name}?`,
      actionLabel: nextStatus === "disabled" ? "Disable Access" : "Enable Access",
      severity: nextStatus === "disabled" ? "danger" : "info",
      onConfirm: () => {
        statusMutation.mutate({ userId, status: nextStatus });
      }
    });
  };

  const handleRemoveMember = (userId: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Team Member",
      description: `WARNING: Removing ${name} from your team is permanent. They will lose access to all company files, dashboards, and export cases immediately.`,
      actionLabel: "Remove Member",
      severity: "danger",
      confirmText: "REMOVE",
      onConfirm: () => {
        removeMutation.mutate(userId);
      }
    });
  };

  const teamMembers = teamData?.data?.items || [];
  const invitations = invitesData?.data?.items || [];

  const isMutationPending = roleMutation.isPending || statusMutation.isPending || removeMutation.isPending;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1F2937]">Team Management</h2>
          <p className="text-sm font-medium text-[#4B5563] mt-1">Manage your team members and invitations</p>
        </div>
        <div className="flex items-center gap-4">
          <InviteMemberDialog />
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-purple-500 rounded-full inline-block"></span>
            Active Team Members
          </h3>
          <div className="text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            {teamMembers.length} Members
          </div>
        </div>

        {teamLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No team members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div key={member.userId} className="flex flex-col bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xl font-black text-[#1F2937] truncate">{member.displayName || "Unknown User"}</h4>
                    <p className="text-xs font-bold text-[#9CA3AF] truncate flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="mb-6 relative z-10">
                  <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Role</p>
                  {member.role === "company_owner" ? (
                    <span className="inline-block px-3 py-1.5 bg-[#EBF8F2] text-[#00A651] text-xs font-black uppercase tracking-widest rounded-lg border border-[#00A651]/20">
                      Company Owner
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      disabled={roleMutation.isPending && roleMutation.variables?.userId === member.userId}
                      onChange={(e) => handleRoleChange(member.userId, member.displayName || member.email, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#00A651]/50 cursor-pointer appearance-none"
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="export_manager">Export Manager</option>
                      <option value="finance_staff">Finance Staff</option>
                    </select>
                  )}
                </div>

                {/* Status & Actions Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between relative z-10">
                  {member.role === "company_owner" ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {member.status}
                    </span>
                  ) : (
                    <button
                      disabled={statusMutation.isPending && statusMutation.variables?.userId === member.userId}
                      onClick={() => handleStatusToggle(member.userId, member.displayName || member.email, member.status)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        member.status === "active"
                          ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      } disabled:opacity-50`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-green-500" : "bg-red-500"}`}></span>
                      {member.status}
                    </button>
                  )}

                  {member.role !== "company_owner" && (
                    <button
                      disabled={removeMutation.isPending && removeMutation.variables === member.userId}
                      onClick={() => handleRemoveMember(member.userId, member.displayName || member.email)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                      title="Remove Member"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-8 md:p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-amber-500 rounded-full inline-block"></span>
            Pending Invitations
          </h3>
          <div className="text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            {invitations.length} Pending
          </div>
        </div>

        {invitesLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <Mail className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No pending invitations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invitations.map((inv) => (
              <div key={inv.invitationId} className="flex flex-col bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card relative overflow-hidden">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                      {inv.status}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-[#1F2937] truncate mt-4">{inv.email}</h4>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#9CA3AF] uppercase tracking-widest text-[9px]">Role</span>
                      <span className="font-bold text-[#4B5563] capitalize">{inv.role.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#9CA3AF] uppercase tracking-widest text-[9px]">Expires</span>
                      <span className="font-bold text-[#4B5563]">{new Date(inv.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    disabled={resendMutation.isPending && resendMutation.variables === inv.invitationId}
                    onClick={() => resendMutation.mutate(inv.invitationId)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Resend Invite
                  </button>
                </div>
              </div>
            ))}
          </div>
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
