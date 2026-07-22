"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import heroBg from "../../public/dashboard-bg.png";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="mb-6 leading-relaxed">
              Welcome to EXORA. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our platform and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Data We Collect About You</h2>
            <p className="mb-4 leading-relaxed">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier, and title.</li>
              <li><strong>Contact Data:</strong> includes billing address, email address, and telephone numbers.</li>
              <li><strong>Financial Data:</strong> includes payment card details and transaction records for your export cases.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
            <p className="mb-6 leading-relaxed">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              <br />- Where we need to perform the contract we are about to enter into or have entered into with you.
              <br />- Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
              <br />- Where we need to comply with a legal obligation.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="mb-6 leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Legal Rights</h2>
            <p className="mb-6 leading-relaxed">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
