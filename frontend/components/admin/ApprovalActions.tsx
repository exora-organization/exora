"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdmin } from "../../lib/api/admin";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { ConfirmWarningDialog } from "../ui/confirm-warning-dialog";
import { AlertTriangle, HelpCircle } from "lucide-react";

interface ApprovalActionsProps {
  companyId: string;
}

export function ApprovalActions({ companyId }: ApprovalActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const approveMutation = useMutation({
    mutationFn: () => apiAdmin.approveCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setApproveOpen(false);
      router.push("/admin-company-approvals");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiAdmin.rejectCompany(companyId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setRejectOpen(false);
      router.push("/admin-company-approvals");
    }
  });

  const revisionMutation = useMutation({
    mutationFn: (notes: string) => apiAdmin.requestRevision(companyId, { revisionNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setRevisionOpen(false);
      router.push("/admin-company-approvals");
    }
  });

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <Button 
        onClick={() => setApproveOpen(true)} 
        disabled={approveMutation.isPending}
        className="bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 font-extrabold uppercase tracking-widest transition-all cursor-pointer"
      >
        Approve
      </Button>
      <Button 
        variant="outline" 
        onClick={() => setRevisionOpen(true)}
        className="border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-6 py-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 font-bold uppercase tracking-widest transition-all cursor-pointer"
      >
        Request Revision
      </Button>
      <Button 
        variant="outline" 
        onClick={() => setRejectOpen(true)}
        className="border-2 border-red-500 text-red-600 hover:bg-red-50 px-6 py-6 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 font-bold uppercase tracking-widest transition-all cursor-pointer"
      >
        Reject
      </Button>

      {/* Approve Dialog */}
      <ConfirmWarningDialog
        isOpen={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={() => approveMutation.mutate()}
        title="Approve Company Application"
        description="WARNING: Approving this application will register the company on the EXORA platform and grant full Company Owner permissions to the applicant. They will be authorized to manage team members and edit company assets."
        actionLabel="Approve Application"
        severity="info"
        isLoading={approveMutation.isPending}
      />

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="border border-[#E8E3D9] shadow-lg rounded-2xl p-6 bg-white max-w-md w-full animate-in fade-in-50 zoom-in-95">
          <DialogHeader className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-3 rounded-xl w-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <DialogTitle className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                Reject Application
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 text-sm mt-1 leading-relaxed font-medium">
              WARNING: Rejecting this application will deny registration for this company. Please provide a clear and detailed reason for rejection below. This notes will be stored in system logs.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="Provide a detailed rejection reason (minimum 5 characters)..."
            rows={4}
            className="w-full mt-2 font-medium"
          />
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <Button variant="outline" className="font-bold border-[#E8E3D9]" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => rejectMutation.mutate(reason.trim())}
              disabled={rejectMutation.isPending || reason.trim().length < 5}
              className="font-bold text-white bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent className="border border-[#E8E3D9] shadow-lg rounded-2xl p-6 bg-white max-w-md w-full animate-in fade-in-50 zoom-in-95">
          <DialogHeader className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-3 rounded-xl w-full">
              <HelpCircle className="h-5 w-5 text-amber-600" />
              <DialogTitle className="text-lg font-bold text-gray-900 font-sans tracking-tight">
                Request Revision
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 text-sm mt-1 leading-relaxed font-medium">
              Specify what details or documents the applicant needs to review or change before the application can be approved.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Revision guidelines/notes (minimum 5 characters)..."
            rows={4}
            className="w-full mt-2 font-medium"
          />
          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <Button variant="outline" className="font-bold border-[#E8E3D9]" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => revisionMutation.mutate(notes.trim())}
              disabled={revisionMutation.isPending || notes.trim().length < 5}
              className="font-bold text-white bg-amber-600 hover:bg-amber-700 hover:text-white"
            >
              {revisionMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
