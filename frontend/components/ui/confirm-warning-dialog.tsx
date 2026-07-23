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
import { AlertTriangle, ShieldAlert, Info, AlertCircle } from "lucide-react"
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
      iconBg: "bg-blue-100",
      text: "text-blue-700",
      icon: <Info className="h-6 w-6 text-blue-600" />,
      buttonClass: "bg-[#1F2937] hover:bg-[#111827] text-white focus:ring-[#1F2937]",
      gradient: "from-blue-50"
    },
    warning: {
      bg: "bg-yellow-50/80 border-yellow-200",
      iconBg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: <AlertTriangle className="h-6 w-6 text-yellow-700" />,
      buttonClass: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-600",
      gradient: "from-yellow-50"
    },
    danger: {
      bg: "bg-red-50/80 border-red-200",
      iconBg: "bg-red-100",
      text: "text-red-700",
      icon: <ShieldAlert className="h-6 w-6 text-red-600" />,
      buttonClass: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500",
      gradient: "from-red-50"
    },
  }

  const currentSeverity = severityConfig[severity]

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md max-w-[95%] border border-[#E8E3D9] shadow-2xl rounded-3xl p-0 bg-white/95 backdrop-blur-xl overflow-hidden animate-in fade-in-50 zoom-in-95 animate-duration-100">
        
        <div className={cn("absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl to-transparent rounded-bl-full opacity-60 -z-10 pointer-events-none", currentSeverity.gradient)}></div>

        <div className="p-8 pb-4">
          <AlertDialogHeader className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 mb-2">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shrink-0", currentSeverity.iconBg)}>
              {currentSeverity.icon}
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-black text-[#1F2937] tracking-tight">
                {title}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-[#4B5563] text-sm leading-relaxed mt-2 font-medium">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmText && (
            <div className="mt-6 space-y-3 bg-[#FAF8F3]/80 p-4 rounded-2xl border border-[#E8E3D9]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                Type <span className="font-mono bg-white text-red-600 px-1.5 py-0.5 rounded border border-[#E8E3D9] shadow-sm select-all">{confirmText}</span> to confirm
              </p>
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={confirmPlaceholder}
                className="w-full h-12 rounded-xl border-[#E8E3D9] bg-white px-4 font-medium focus-visible:border-red-400 focus-visible:ring-4 focus-visible:ring-red-400/10"
                disabled={isLoading}
              />
            </div>
          )}

          <AlertDialogFooter className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-[#E8E3D9]/50">
            <AlertDialogCancel
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto h-12 px-6 rounded-xl border-[#E8E3D9] font-bold text-[#4B5563] hover:bg-[#FAF8F3] hover:text-[#1F2937]"
            >
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                onConfirm()
              }}
              disabled={isConfirmDisabled}
              className={cn("w-full sm:w-auto h-12 px-6 rounded-xl font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2", currentSeverity.buttonClass, isConfirmDisabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-md")}
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
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
