"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./alert-dialog"
import { Input } from "./input"
import { AlertTriangle, ShieldAlert, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmWarningDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  actionLabel?: string
  cancelLabel?: string
  severity?: "info" | "warning" | "danger"
  confirmText?: string // If provided, user must type this exact string to confirm
  confirmPlaceholder?: string
  isLoading?: boolean
}

export function ConfirmWarningDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  actionLabel = "Confirm",
  cancelLabel = "Cancel",
  severity = "warning",
  confirmText,
  confirmPlaceholder = "Type here to confirm",
  isLoading = false,
}: ConfirmWarningDialogProps) {
  const [userInput, setUserInput] = React.useState("")

  // Reset input when dialog closes/opens
  React.useEffect(() => {
    if (!isOpen) {
      setUserInput("")
    }
  }, [isOpen])

  const isConfirmDisabled = isLoading || (!!confirmText && userInput !== confirmText)

  const severityConfig = {
    info: {
      bg: "bg-blue-50/80 border-blue-200",
      text: "text-blue-700",
      icon: <Info className="h-5 w-5 text-blue-600" />,
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    },
    warning: {
      bg: "bg-amber-50/80 border-amber-200",
      text: "text-amber-700",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      buttonClass: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
    },
    danger: {
      bg: "bg-red-50/80 border-red-200",
      text: "text-red-700",
      icon: <ShieldAlert className="h-5 w-5 text-red-600" />,
      buttonClass: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    },
  }

  const currentSeverity = severityConfig[severity]

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-w-[95%] border border-[#E8E3D9] shadow-lg rounded-2xl p-6 bg-white overflow-hidden animate-in fade-in-50 zoom-in-95 animate-duration-100">
        <AlertDialogHeader className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
          <div className={cn("flex items-center gap-3 w-full border-b pb-4", currentSeverity.bg, "p-3 rounded-xl border")}>
            {currentSeverity.icon}
            <AlertDialogTitle className="text-lg font-bold text-gray-900 font-sans tracking-tight">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 text-sm leading-relaxed mt-2 font-medium">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {confirmText && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              To proceed, please type <span className="font-mono bg-slate-100 text-red-600 px-1.5 py-0.5 rounded border border-slate-200">{confirmText}</span> below:
            </p>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={confirmPlaceholder}
              className="w-full font-medium"
              disabled={isLoading}
            />
          </div>
        )}

        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="font-bold border-[#E8E3D9] text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1F2937]"
            variant="outline"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isConfirmDisabled}
            className={cn("font-bold text-white shadow-sm flex items-center justify-center gap-2", currentSeverity.buttonClass)}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
