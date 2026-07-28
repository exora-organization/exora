"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { flushSync } from "react-dom";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(13);
  const [downloadDate, setDownloadDate] = useState(() =>
    new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
  );
  const previewRef = useRef<HTMLDivElement>(null);

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
    if (!previewRef.current) {
      toast.error("Preview not ready. Please wait for the document to load.");
      return;
    }
    setIsDownloading(true);
    // Use native browser print by cloning the preview content into the main DOM.
    // This ensures all Next.js/Tailwind precompiled styles, custom fonts, and colors match EXACTLY.
    try {
      const printContainer = document.createElement("div");
      printContainer.id = "pdf-print-container";
      
      // Clone the content and add a wrapper with A4 dimensions and white background
      printContainer.innerHTML = `
        <div style="width: 210mm; margin: 0 auto; background-color: white !important; padding: 10mm;">
          ${previewRef.current.innerHTML}
        </div>
      `;
      
      document.body.appendChild(printContainer);

      // Create a print-specific stylesheet that hides the rest of the application
      const style = document.createElement("style");
      style.id = "pdf-print-style";
      style.textContent = `
        @media print {
          /* Hide EVERYTHING in the main app */
          body > *:not(#pdf-print-container) {
            display: none !important;
          }
          
          /* Show our print container */
          #pdf-print-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          @page {
            margin: 15mm;
            size: A4 portrait;
          }
        }
        
        /* Hide the print container on screen */
        @media screen {
          #pdf-print-container {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);

      // Wait a tiny bit for the browser to parse the new nodes
      setTimeout(() => {
        window.print();
        
        // Cleanup immediately after print dialog closes
        document.body.removeChild(printContainer);
        document.head.removeChild(style);
        
        setIsDownloading(false);
      }, 300);

    } catch (err: any) {
      toast.error(err.message || "Failed to prepare print document.");
      setIsDownloading(false);
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
              className="w-8 h-8 rounded-lg border border-[#E8E3D9] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-[#6B7280]" />
            </button>
            <span className="text-xs font-bold text-[#9CA3AF] w-8 text-center">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(24, f + 1))}
              className="w-8 h-8 rounded-lg border border-[#E8E3D9] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-[#6B7280]" />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || isLoading || !content}
              className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-[#00A651] hover:bg-[#008F44] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-[#E8E3D9] flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
            >
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8" style={{backgroundColor:'#F8FAFC'}}>
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
              <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-[#EF4444]" />
              </div>
              <p className="text-sm font-bold text-[#B91C1C] text-center max-w-sm">{error}</p>
              <button
                onClick={fetchPreview}
                className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {content && !isLoading && (
            <div ref={previewRef} className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden mb-8 transition-all font-sans" style={{border:'1px solid #E5E7EB'}}>
              {/* Corporate Letterhead Header (Centered & Clean) */}
              <div className="px-8 sm:px-12 py-6 bg-white text-center" style={{borderBottom:'1px solid #E5E7EB'}}>
                <div className="pb-5 max-w-xl mx-auto space-y-1" style={{borderBottom:'2px solid #0F172A'}}>
                  <h2 className="text-2xl font-black text-[#1F2937] tracking-tight uppercase">EXORA LOGISTICS & TRADE</h2>
                  <p className="text-xs font-medium leading-normal" style={{color:'#6B7280'}}>
                    President University, Jababeka Education Park, Cikarang, Indonesia
                  </p>
                  <p className="text-xs font-semibold" style={{color:'#334155'}}>
                    support@exora.com
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 text-xs">
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest block" style={{color:'#9CA3AF'}}>DOCUMENT</span>
                    <span className="font-extrabold text-[#1F2937] text-sm uppercase">
                      {filename.replace(/\.pdf$/i, '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest block" style={{color:'#9CA3AF'}}>DATE</span>
                    <span className="font-bold text-[#1F2937]">
                      {downloadDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Inner Content */}
              <div
                className="p-8 sm:p-12 bg-white min-h-[500px] leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {content.split('\n').map((rawLine, i) => {
                  const line = rawLine.trimEnd();
                  const trimmed = line.trim();

                  const renderBold = (text: string) => {
                    if (!text.includes('**')) return text;
                    const parts = text.split('**');
                    return parts.map((part, idx) => {
                      if (idx % 2 === 1) {
                        return <strong key={idx} className="font-extrabold text-[#1F2937]">{part}</strong>;
                      }
                      return <span key={idx}>{part}</span>;
                    });
                  };

                  const isMainHeader = trimmed.startsWith('EXORA —') || trimmed.startsWith('EXORA -');
                  const isSectionHeader = trimmed.startsWith('===');
                  const isDivider = trimmed.includes('────────') || trimmed.startsWith('---');

                  if (isMainHeader) {
                    return (
                      <div key={i} className="font-black text-[#1F2937] text-xl uppercase pb-3 mb-6 tracking-tight flex items-center justify-between" style={{borderBottom:'2px solid #F1F5F9'}}>
                        <span>{trimmed.replace(/^EXORA [—-]\s*/, '')}</span>
                        <span className="text-xs font-extrabold text-[#00A651] bg-[#EBF8F2] px-3 py-1 rounded-full uppercase" style={{border:'1px solid rgba(0,166,81,0.3)'}}>OFFICIAL DOCUMENT</span>
                      </div>
                    );
                  }
                  
                  if (isSectionHeader) {
                    return (
                      <div key={i} className="font-black text-[#1F2937] text-xs uppercase tracking-widest mt-8 mb-4 px-4 py-2 rounded-lg" style={{backgroundColor:'#F1F5F9',borderLeft:'4px solid #1E293B'}}>
                        {trimmed.replace(/=/g, '').trim()}
                      </div>
                    );
                  }

                  if (isDivider) {
                    return <div key={i} className="h-px my-4" style={{backgroundColor:'#E2E8F0'}}></div>;
                  }

                  // Handle Markdown Headers: #, ##, ###, ####
                  if (trimmed.startsWith('# ')) {
                    return (
                      <div key={i} className="font-black text-[#1F2937] text-lg mt-6 mb-3 pb-2 border-b border-slate-200 uppercase tracking-tight">
                        {renderBold(trimmed.replace(/^#\s+/, ''))}
                      </div>
                    );
                  }
                  if (trimmed.startsWith('## ')) {
                    return (
                      <div key={i} className="font-extrabold text-[#1F2937] text-base mt-6 mb-3 border-b border-slate-100 pb-1">
                        {renderBold(trimmed.replace(/^##\s+/, ''))}
                      </div>
                    );
                  }
                  if (trimmed.startsWith('### ')) {
                    return (
                      <div key={i} className="font-extrabold text-[#1E293B] text-sm mt-5 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] inline-block shrink-0" />
                        {renderBold(trimmed.replace(/^###\s+/, ''))}
                      </div>
                    );
                  }
                  if (trimmed.startsWith('#### ')) {
                    return (
                      <div key={i} className="font-bold text-[#334155] text-xs mt-4 mb-2 uppercase tracking-wider">
                        {renderBold(trimmed.replace(/^####\s+/, ''))}
                      </div>
                    );
                  }

                  // Handle Metadata Badges (separated by | )
                  if (trimmed.includes(' | ') && !trimmed.startsWith('*') && !trimmed.startsWith('-')) {
                    const badges = trimmed.split(' | ');
                    return (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 mt-2">
                        {badges.map((b, idx) => (
                          <div key={idx} className="p-3 rounded-xl" style={{backgroundColor:'#F8FAFC',border:'1px solid #E2E8F0'}}>
                            <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5" style={{color:'#9CA3AF'}}>DETAIL #{idx + 1}</span>
                            <span className="text-xs font-extrabold text-[#1F2937] truncate block">{b.trim()}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  // Handle Tabular Data (lines with colon and 2+ spaces)
                  if (trimmed.includes(':') && trimmed.match(/:\s{2,}/)) {
                    const parts = trimmed.split(/:\s{2,}/);
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(': ').trim();
                    return (
                      <div key={i} className="flex justify-between items-center py-2.5 px-3 rounded-lg transition-colors font-medium" style={{borderBottom:'1px solid #F1F5F9'}}>
                        <span className="font-semibold text-xs" style={{color:'#475569'}}>{label}</span>
                        <span className="font-extrabold text-[#1F2937] text-xs">{value}</span>
                      </div>
                    );
                  }

                  // Empty lines
                  if (!trimmed) {
                    return <div key={i} className="h-2"></div>;
                  }

                  // Handle Markdown Bullet & Numbered Lists (*, -, + or 1.)
                  const isNumberedList = /^\d+\.\s/.test(trimmed);
                  const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ');
                  const cleanedText = isBullet ? trimmed.replace(/^[\*\-\+]\s+/, '') : trimmed;

                  return (
                    <div 
                      key={i} 
                      className={`font-medium text-xs ${isNumberedList || isBullet ? 'ml-5 mb-2 relative' : 'mb-2.5'}`}
                      style={{color:'#334155'}}
                    >
                      {isBullet && (
                        <span className="absolute -left-4 top-0.5 text-[#00A651] font-extrabold text-sm leading-none">•</span>
                      )}
                      {renderBold(cleanedText)}
                    </div>
                  );
                })}

                {/* Professional Signature & Authorization Stamp Block (Inspired by Official Commercial Quotes) */}
                <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-between items-end gap-6" style={{borderTop:'1px solid #E2E8F0'}}>
                  <div className="text-xs font-medium space-y-1" style={{color:'#64748B'}}>
                    <p className="font-extrabold text-[#1F2937]">IMPORTANT NOTICE:</p>
                    <p>• Valid for 30 calendar days from the date of issuance.</p>
                    <p>• Subject to official EXORA export terms and verified trade compliance protocols.</p>
                  </div>

                  <div className="text-center shrink-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{color:'#94A3B8'}}>AUTHORIZED SIGNATURE</p>
                    <div className="w-40 h-16 rounded-xl flex flex-col items-center justify-center p-2 relative" style={{border:'1px dashed #6EE7B7',backgroundColor:'rgba(236,253,245,0.5)'}}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#00A651] font-black text-[9px] uppercase tracking-tighter opacity-80 rotate-[-12deg]" style={{border:'2px solid #00A651'}}>
                        EXORA
                      </div>
                      <span className="text-[9px] font-bold text-[#00A651] mt-1 uppercase tracking-widest">OFFICIAL STAMP</span>
                    </div>
                    <p className="text-xs font-black text-[#1F2937] mt-2">Export Operations Manager</p>
                    <p className="text-[10px] font-semibold" style={{color:'#64748B'}}>EXORA Trade & Logistics Engine</p>
                  </div>
                </div>
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
            disabled={isDownloading || isLoading || !content}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E8E3D9] text-[#1F2937] text-xs font-semibold hover:bg-[#F9FAFB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {isDownloading ? "Generating..." : "Save File"}
          </button>
        </div>
      </div>
    </div>
  );
}
