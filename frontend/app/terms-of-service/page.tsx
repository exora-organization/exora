"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import heroBg from "../../public/dashboard-bg.png";

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col font-sans bg-[#FAFAF9] min-h-screen selection:bg-[#00A651]/20">
      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div
        className="relative flex flex-col overflow-hidden h-[40vh] min-h-[300px] justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.8), rgba(12, 30, 28, 0.7)), url(${heroBg.src})`
        }}
      >
        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center mt-10">
          <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow">
            Terms of Service
          </h1>
          <p className="mt-4 text-base lg:text-xl text-gray-200 font-medium max-w-2xl drop-shadow-sm">
            Last Updated: July 22, 2026
          </p>
        </main>
      </div>

      {/* ================= CONTENT SECTION ================= */}
      <section className="py-20 px-6 lg:px-20">
        <div className="max-w-4xl mx-auto bg-white p-10 lg:p-16 rounded-3xl shadow-xl border border-gray-100">
          <div className="prose prose-emerald lg:prose-lg max-w-none text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="mb-6 leading-relaxed">
              By accessing our platform, EXORA, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="mb-4 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on EXORA's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial).</li>
              <li>Attempt to decompile or reverse engineer any software contained on EXORA's website.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
            <p className="mb-6 leading-relaxed">
              The materials on EXORA's website are provided on an 'as is' basis. EXORA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
            <p className="mb-6 leading-relaxed">
              In no event shall EXORA or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EXORA's website, even if EXORA or an EXORA authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Revisions and Errata</h2>
            <p className="mb-6 leading-relaxed">
              The materials appearing on EXORA's website could include technical, typographical, or photographic errors. EXORA does not warrant that any of the materials on its website are accurate, complete, or current. EXORA may make changes to the materials contained on its website at any time without notice.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
