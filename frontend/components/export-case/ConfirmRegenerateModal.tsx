"use client";

import { Icon } from "@iconify/react";
import { Button } from "../ui/button";

interface ConfirmRegenerateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function ConfirmRegenerateModal({
  open,
  onClose,
  onConfirm,
  isPending = false,
}: ConfirmRegenerateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E8E3D9] shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Icon icon="solar:shield-warning-bold-duotone" className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-[#1F2937]">
              Regenerate AI Recommendation?
            </h4>
            <p className="text-xs text-[#9CA3AF] font-bold uppercase tracking-wider">
              Overwrite Warning
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-[#4B5563] leading-relaxed bg-[#FAF8F3] p-4 rounded-2xl border border-[#E8E3D9]">
          Generating a new AI recommendation will overwrite the previous analysis for this case. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="outline"
            className="rounded-xl font-bold text-xs h-10 px-4 border-gray-200 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl font-bold text-xs h-10 px-5 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Icon icon="solar:round-transfer-horizontal-bold-duotone" className="w-4 h-4 animate-spin" />
                Generating...
              </span>
            ) : (
              "Yes, Regenerate"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
