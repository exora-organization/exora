"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiOwner } from "../../../lib/api/owner";
import { InviteMemberDialog } from "../../../components/owner/InviteMemberDialog";
import { ConfirmWarningDialog } from "../../../components/ui/confirm-warning-dialog";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

export default function TeamManagementPage() {
  const queryClient = useQueryClient();
  const [resentLink, setResentLink] = useState<string | null>(null);
  const [copiedResent, setCopiedResent] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberRoleFilter, setMemberRoleFilter] = useState("all");
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteRoleFilter, setInviteRoleFilter] = useState("all");

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
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      if (res?.data?.inviteUrl) {
        setResentLink(res.data.inviteUrl);
      } else {
        toast.success("Invitation resent successfully!");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend invitation.");
    }
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => apiOwner.deleteInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      toast.success("Invitation cancelled successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel invitation.");
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

  const handleCancelInvitation = (invitationId: string, email: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancel Invitation",
      description: `Are you sure you want to cancel the invitation sent to ${email}? This will render their invitation link invalid immediately.`,
      actionLabel: "Cancel Invite",
      severity: "danger",
      onConfirm: () => {
        deleteInvitationMutation.mutate(invitationId);
      }
    });
  };

  const teamMembers = teamData?.data?.items || [];
  const invitations = invitesData?.data?.items || [];

  const filteredMembers = useMemo(() => {
    let arr = [...teamMembers];
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      arr = arr.filter(
        (m) =>
          (m.displayName || "").toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }
    if (memberRoleFilter !== "all") {
      arr = arr.filter((m) => m.role === memberRoleFilter);
    }
    return arr;
  }, [teamMembers, memberSearch, memberRoleFilter]);

  const filteredInvitations = useMemo(() => {
    let arr = [...invitations];
    if (inviteSearch.trim()) {
      const q = inviteSearch.toLowerCase();
      arr = arr.filter((inv) => inv.email.toLowerCase().includes(q));
    }
    if (inviteRoleFilter !== "all") {
      arr = arr.filter((inv) => inv.role === inviteRoleFilter);
    }
    return arr;
  }, [invitations, inviteSearch, inviteRoleFilter]);

  const isMutationPending = roleMutation.isPending || statusMutation.isPending || removeMutation.isPending || deleteInvitationMutation.isPending;

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
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-green-500 rounded-full inline-block"></span>
            Active Team Members
          </h3>
          <div className="text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 shrink-0">
            {filteredMembers.length} of {teamMembers.length} Members
          </div>
        </div>
        {/* Member Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
            <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
              placeholder="Search by name or email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
              value={memberRoleFilter}
              onChange={(e) => setMemberRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="company_owner">Company Owner</option>
              <option value="export_manager">Export Manager</option>
              <option value="finance_staff">Finance Staff</option>
            </select>
          </div>
        </div>

        {teamLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No members match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <div key={member.userId} className="flex flex-col bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xl font-black text-[#1F2937] truncate">{member.displayName || "Unknown User"}</h4>
                    <p className="text-xs font-bold text-[#9CA3AF] truncate flex items-center gap-1 mt-1">
                      <Icon icon="solar:letter-bold-duotone" className="w-3 h-3" />
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
                      <Icon icon="solar:user-cross-bold-duotone" className="w-4 h-4" />
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-extrabold text-[#1F2937] flex items-center gap-3">
            <span className="w-3 h-8 bg-amber-500 rounded-full inline-block"></span>
            Pending Invitations
          </h3>
          <div className="text-[11px] font-black uppercase tracking-widest px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
            {filteredInvitations.length} of {invitations.length} Pending
          </div>
        </div>
        {/* Invitation Search & Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2">
            <Icon icon="solar:magnifer-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-400"
              placeholder="Search by email..."
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Icon icon="solar:filter-bold-duotone" className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              className="text-sm bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-3 py-2 font-semibold outline-none"
              value={inviteRoleFilter}
              onChange={(e) => setInviteRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="export_manager">Export Manager</option>
              <option value="finance_staff">Finance Staff</option>
            </select>
          </div>
        </div>

        {invitesLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center">
            <Icon icon="solar:letter-bold-duotone" className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No invitations match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvitations.map((inv) => (
              <div key={inv.invitationId} className="flex flex-col bg-white rounded-3xl border border-[#E8E3D9] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/card relative overflow-hidden">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                      <Icon icon="solar:clock-circle-bold-duotone" className="w-5 h-5 text-amber-500" />
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

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <button
                    disabled={resendMutation.isPending && resendMutation.variables === inv.invitationId}
                    onClick={() => resendMutation.mutate(inv.invitationId)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Icon icon="solar:plain-bold-duotone" className="w-4 h-4" />
                    Resend
                  </button>
                  <button
                    disabled={deleteInvitationMutation.isPending && deleteInvitationMutation.variables === inv.invitationId}
                    onClick={() => handleCancelInvitation(inv.invitationId, inv.email)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                    title="Cancel Invitation"
                  >
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-4 h-4" />
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

      {/* Resent Link Dialog */}
      <Dialog open={!!resentLink} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setResentLink(null);
          setCopiedResent(false);
        }
      }}>
        <DialogContent className="sm:max-w-md max-w-[95%] border border-[#E8E3D9] shadow-2xl rounded-3xl p-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-60 -z-10 pointer-events-none"></div>
          <div className="p-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <Icon icon="solar:check-circle-bold-duotone" className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#1F2937]">Invitation Renewed</DialogTitle>
            <DialogDescription className="text-sm font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">
              Copy the link below to send to the member manually
            </DialogDescription>
            
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                readOnly
                value={resentLink || ""}
                className="flex-1 px-4 py-3 bg-[#FAF8F3]/50 border-2 border-[#E8E3D9] rounded-2xl text-sm font-semibold focus:outline-none focus:border-amber-500 text-gray-700"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                onClick={() => {
                  if (resentLink) {
                    navigator.clipboard.writeText(resentLink);
                    setCopiedResent(true);
                    toast.success("Copied to clipboard!");
                    setTimeout(() => setCopiedResent(false), 2000);
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-6 rounded-2xl h-12 shrink-0 flex items-center gap-2"
              >
                {copiedResent ? <Icon icon="solar:check-circle-bold-duotone" className="w-5 h-5" /> : <Icon icon="solar:copy-bold-duotone" className="w-5 h-5" />}
                {copiedResent ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
