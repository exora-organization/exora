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
import { UserPlus, Send, Copy, CheckCircle2 } from "lucide-react";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["export_manager", "finance_staff"]),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold px-6 py-2 h-12 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Invite Member
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setInviteLink(null);
          reset();
        }
        setOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-md max-w-[95%] border border-[#E8E3D9] shadow-2xl rounded-3xl p-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-60 -z-10 pointer-events-none"></div>

          <div className="p-8 pb-4">
            <DialogHeader className="mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-[#00A651]" />
              </div>
              <DialogTitle className="text-2xl font-black text-[#1F2937]">Invite Team Member</DialogTitle>
              <DialogDescription className="text-sm font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">
                Add a new member to your company
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {inviteLink ? (
                <div className="space-y-4 p-5 bg-[#FAF8F3]/80 rounded-2xl border border-[#E8E3D9]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider leading-relaxed">
                      Invitation created! Please copy the link below and send it to the member manually:
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      readOnly 
                      value={inviteLink} 
                      className="bg-white border-[#E8E3D9] rounded-xl font-medium text-xs focus-visible:ring-[#00A651]/20 h-11" 
                    />
                    <Button 
                      type="button" 
                      onClick={handleCopy}
                      className={`h-11 px-4 rounded-xl font-bold transition-all ${
                        copied 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "bg-[#00A651] hover:bg-[#008F44] text-white"
                      }`}
                    >
                      {copied ? "Copied!" : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      className="h-12 rounded-xl border-[#E8E3D9] bg-[#FAF8F3]/50 px-4 focus-visible:border-[#00A651] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#00A651]/10 font-medium"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Role</Label>
                    <div className="relative">
                      <select
                        id="role"
                        className="flex h-12 w-full rounded-xl border border-[#E8E3D9] bg-[#FAF8F3]/50 px-4 py-2 font-medium text-sm focus-visible:outline-none focus-visible:border-[#00A651] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#00A651]/10 appearance-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                        {...register("role")}
                      >
                        <option value="export_manager">Export Manager</option>
                        <option value="finance_staff">Finance Staff</option>
                      </select>
                    </div>
                    {errors.role && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{errors.role.message}</p>
                    )}
                  </div>

                  {errorMsg && (
                    <div className="p-3 text-[11px] font-bold uppercase tracking-widest bg-red-50 text-red-600 rounded-xl border border-red-100">
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="sm:justify-end gap-3 pt-2">
                {inviteLink ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      setOpen(false);
                      setInviteLink(null);
                      reset();
                    }}
                    className="w-full sm:w-auto bg-[#1F2937] hover:bg-[#111827] text-white font-bold h-12 px-8 rounded-xl"
                  >
                    Done
                  </Button>
                ) : (
                  <>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpen(false)}
                      className="w-full sm:w-auto h-12 px-6 rounded-xl border-[#E8E3D9] font-bold text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1F2937]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={inviteMutation.isPending}
                      className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      {inviteMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                          Generating...
                        </span>
                      ) : (
                        "Generate Invitation"
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
