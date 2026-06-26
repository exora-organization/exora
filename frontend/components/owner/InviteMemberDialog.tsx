"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiOwner } from "../../lib/api/owner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["export_manager", "finance_staff"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "export_manager",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteFormValues) => apiOwner.inviteMember(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      // Because email delivery is not yet implemented in the backend,
      // we show the link directly to the user so they can copy it.
      if (res?.data?.inviteUrl) {
        setInviteLink(res.data.inviteUrl);
      } else {
        setOpen(false);
        reset();
      }
      setErrorMsg(null);
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Failed to send invitation.");
    }
  });

  const onSubmit = (data: InviteFormValues) => {
    setErrorMsg(null);
    inviteMutation.mutate(data);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite Member</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an email invitation to add a new member to your company.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {inviteLink ? (
              <div className="space-y-4 p-4 bg-green-50 rounded-md border border-green-200">
                <p className="text-sm text-green-800 font-medium">
                  Invitation created! Since email delivery is not yet configured, please copy the link below and send it to the member manually:
                </p>
                <div className="flex gap-2">
                  <Input readOnly value={inviteLink} className="bg-white" />
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(inviteLink)}
                  >
                    Copy
                  </Button>
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" onClick={() => {
                    setOpen(false);
                    setInviteLink(null);
                    reset();
                  }}>
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("role")}
                  >
                    <option value="export_manager">Export Manager</option>
                    <option value="finance_staff">Finance Staff</option>
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role.message}</p>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
                    {errorMsg}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Generating..." : "Generate Invitation"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
