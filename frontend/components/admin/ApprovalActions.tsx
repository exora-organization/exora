"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAdmin } from "../../lib/api/admin";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

interface ApprovalActionsProps {
  companyId: string;
}

export function ApprovalActions({ companyId }: ApprovalActionsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const approveMutation = useMutation({
    mutationFn: () => apiAdmin.approveCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      router.push("/company-approvals");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiAdmin.rejectCompany(companyId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setRejectOpen(false);
      router.push("/company-approvals");
    }
  });

  const revisionMutation = useMutation({
    mutationFn: (notes: string) => apiAdmin.requestRevision(companyId, { revisionNotes: notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setRevisionOpen(false);
      router.push("/company-approvals");
    }
  });

  return (
    <div className="flex gap-4">
      <Button 
        onClick={() => approveMutation.mutate()} 
        disabled={approveMutation.isPending}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Approve
      </Button>
      <Button 
        variant="outline" 
        onClick={() => setRevisionOpen(true)}
      >
        Request Revision
      </Button>
      <Button 
        variant="destructive" 
        onClick={() => setRejectOpen(true)}
      >
        Reject
      </Button>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be recorded.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            placeholder="Rejection reason (min 5 chars)"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => rejectMutation.mutate(reason)}
              disabled={rejectMutation.isPending || reason.length < 5}
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={revisionOpen} onOpenChange={setRevisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Provide notes on what the applicant needs to change before approval.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Revision notes (min 5 chars)"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => revisionMutation.mutate(notes)}
              disabled={revisionMutation.isPending || notes.length < 5}
            >
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
