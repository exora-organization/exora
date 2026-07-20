"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, FileText, Loader2, AlertCircle, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

interface PdfPreviewModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** The documentId from the backend */
  documentId: string;
  /** Human-readable filename for display & download */
  filename: string;
}

/**
 * PdfPreviewModal
 * ───────────────
 * Fetches the document content from the backend /preview endpoint and renders
 * it in a scrollable, zoomable text panel. The Download button triggers a real
 * blob download from the /download endpoint.
 */
export function PdfPreviewModal({
  open,
  onClose,
  documentId,
  filename,
}: PdfPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(13);

  const fetchPreview = useCallback(async () => {
    if (!documentId) return;
    setIsLoading(true);
    setError(null);
    setContent(null);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
      const { auth } = await import("../../lib/firebase/client");
      const token = auth.currentUser
        ? await auth.currentUser.getIdToken()
        : null;

      const res = await fetch(
        `${API_BASE_URL}/documents/${documentId}/preview`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error?.message || `Failed to load preview (${res.status})`
        );
      }

      const text = await res.text();
      setContent(text);
    } catch (err: any) {
      setError(err.message || "Failed to load document preview.");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (open && documentId) {
      fetchPreview();
    }
    if (!open) {
      setContent(null);
      setError(null);
      setFontSize(13);
    }
  }, [open, documentId, fetchPreview]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleDownload = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";
      const { auth } = await import("../../lib/firebase/client");
      const token = auth.currentUser
        ? await auth.currentUser.getIdToken()
        : null;

      const res = await fetch(
        `${API_BASE_URL}/documents/${documentId}/download`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`"${filename}" downloaded successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Download failed.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal panel */}
      <div
        className="relative flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ width: "min(900px, 95vw)", height: "min(780px, 90vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E3D9] bg-[#FAFAF9] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#EBF8F2] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#00A651]" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-[#1F2937] text-sm truncate">{filename}</p>
              <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">
                Document Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-4">
            {/* Zoom controls */}
            <button
              onClick={() => setFontSize((f) => Math.max(9, f - 1))}
              className="w-8 h-8 rounded-lg border border-[#E8E3D9] flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="text-xs font-bold text-gray-400 w-8 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(24, f + 1))}
              className="w-8 h-8 rounded-lg border border-[#E8E3D9] flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold transition-all shadow-md shadow-[#00A651]/20 hover:shadow-lg hover:-translate-y-px"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#E8E3D9] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-[#F5F5F0] p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EBF8F2] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00A651] animate-spin" />
              </div>
              <p className="text-sm font-bold text-[#9CA3AF]">Loading document preview...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-700 text-center max-w-sm">{error}</p>
              <button
                onClick={fetchPreview}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {content && !isLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#E8E3D9] overflow-hidden">
              {/* Document header bar */}
              <div className="px-6 py-3 border-b border-[#E8E3D9] bg-gradient-to-r from-[#EBF8F2] to-[#F0FDF4] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00A651]"></div>
                  <span className="text-[10px] font-bold text-[#00A651] uppercase tracking-widest">EXORA Document</span>
                </div>
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                  {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              {/* Content */}
              <pre
                className="p-6 text-[#1F2937] font-mono leading-relaxed whitespace-pre-wrap break-words"
                style={{ fontSize: `${fontSize}px` }}
              >
                {content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E8E3D9] bg-[#FAFAF9] flex items-center justify-between shrink-0">
          <p className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">
            Generated by EXORA Engine · Confidential
          </p>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E8E3D9] text-[#1F2937] text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Save File
          </button>
        </div>
      </div>
    </div>
  );
}
