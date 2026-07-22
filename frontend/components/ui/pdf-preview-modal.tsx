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
        className="relative flex flex-col bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden"
        style={{ width: "min(900px, 95vw)", height: "min(780px, 90vh)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E3D9] bg-white/50 shrink-0">
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
              className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-[#00A651] hover:bg-[#008F44] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4" />
              Download PDF
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
        <div className="flex-1 overflow-auto bg-slate-50/80 p-4 sm:p-8">
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
            <div className="max-w-4xl mx-auto bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden mb-8 transition-all">
              {/* Document header bar */}
              <div className="px-8 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">EXORA Official Document</span>
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              {/* Content */}
              <div
                className="p-8 sm:p-14 bg-white min-h-[600px] selection:bg-emerald-100"
                style={{ fontSize: `${fontSize}px` }}
              >
                {content.split('\n').map((line, i) => {
                  const isMainHeader = line.startsWith('EXORA —') || line.startsWith('EXORA -');
                  const isSectionHeader = line.startsWith('===');
                  const isDivider = line.includes('────────');

                  if (isMainHeader) {
                    return (
                      <div key={i} className="font-sans font-black text-emerald-800 text-3xl border-b-[4px] border-emerald-500 pb-4 mb-8 tracking-tight">
                        {line}
                      </div>
                    );
                  }
                  
                  if (isSectionHeader) {
                    return (
                      <div key={i} className="font-sans font-extrabold text-emerald-700 text-sm mt-10 mb-5 tracking-widest bg-emerald-50 px-4 py-2 rounded-xl inline-block border border-emerald-100">
                        {line.replace(/=/g, '').trim()}
                      </div>
                    );
                  }

                  if (isDivider) {
                    return <div key={i} className="h-px bg-gray-200 my-4"></div>;
                  }

                  // Handle Markdown H2
                  if (line.startsWith('## ')) {
                    return (
                      <div key={i} className="font-sans font-bold text-gray-900 text-lg mt-6 mb-3">
                        {line.replace(/^##\s*/, '')}
                      </div>
                    );
                  }

                  // Handle Metadata Badges (separated by | )
                  if (line.includes(' | ')) {
                    const badges = line.split(' | ');
                    return (
                      <div key={i} className="flex flex-wrap gap-2 mb-6 font-sans mt-2">
                        {badges.map((b, idx) => (
                          <span key={idx} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm">
                            {b.trim()}
                          </span>
                        ))}
                      </div>
                    );
                  }

                  // Handle Tabular Data (lines with colon and 2+ spaces)
                  if (line.includes(':') && line.match(/:\s{2,}/)) {
                    const parts = line.split(/:\s{2,}/);
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(': ').trim();
                    return (
                      <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-100 border-dashed font-sans hover:bg-slate-50 px-2 rounded-lg transition-colors">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="font-bold text-gray-900">{value}</span>
                      </div>
                    );
                  }

                  // Empty lines
                  if (!line.trim()) {
                    return <div key={i} className="h-3"></div>;
                  }

                  // Handle Markdown Lists
                  const isNumberedList = /^\d+\.\s/.test(line);
                  const isBullet = line.startsWith('- ');

                  // Parse bold **text**
                  const renderBold = (text: string) => {
                    if (!text.includes('**')) return text;
                    const parts = text.split('**');
                    return parts.map((part, idx) => {
                      if (idx % 2 === 1) {
                        return <strong key={idx} className="font-bold text-gray-900">{part}</strong>;
                      }
                      return <span key={idx}>{part}</span>;
                    });
                  };

                  return (
                    <div 
                      key={i} 
                      className={`font-sans text-gray-700 leading-relaxed ${isNumberedList || isBullet ? 'ml-6 mb-3 relative' : 'mb-3'}`}
                    >
                      {isBullet && <span className="absolute -left-5 top-0 text-gray-400">•</span>}
                      {renderBold(line)}
                    </div>
                  );
                })}
              </div>
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
