"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import Image from "next/image";
import { Ship, Plane, Truck, ArrowRight, ShieldCheck, Calculator, FileText } from "lucide-react";
import dashboardBg from "../public/dashboard-bg.png";
import { PublicNavbar } from "../components/public/PublicNavbar";
import { PublicFooter } from "../components/public/PublicFooter";

export default function Home() {
  const { role, profile, loading, isAuthenticated } = useUserProfile();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePortalClick = () => {
    setIsNavigating(true);

    if (isAuthenticated && role) {
      if (role === "admin") router.push("/admin-dashboard");
      else if (role === "company_owner") router.push("/owner-dashboard");
      else if (role === "export_manager") router.push("/export-manager-dashboard");
      else if (role === "finance_staff") router.push("/finance-dashboard");
      else {
        if (profile?.companyId || profile?.companyStatus) {
          router.push("/application-status");
        } else {
          router.push("/company-application");
        }
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col font-sans bg-[#f8fcfb] min-h-screen selection:bg-[#0a9b5c]/20">
      
      {/* ================= HERO SECTION ================= */}
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={dashboardBg} 
            alt="Dashboard Background" 
            fill 
            priority
            className="object-cover object-center scale-105"
          />
        </div>
        {/* Premium Glassmorphism Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#eafaf6]/90 via-white/80 to-[#e3f4f9]/90 backdrop-blur-[4px]"></div>

        {/* Navbar */}
        <PublicNavbar />

        {/* Hero Section Content */}
        <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto w-full py-16 lg:py-0 gap-16">
          
          {/* Left Column - Copy */}
          <div className="flex-1 space-y-8 max-w-2xl transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
            <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-md border border-[#0a9b5c]/20 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-[#0a9b5c] tracking-widest uppercase">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a9b5c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0a9b5c]"></span>
              </span>
              <span>Export Costing & Feasibility Engine</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#022f35] leading-[1.15] tracking-tight pb-2">
              Scale Your Global Trade Faster.
            </h1>
            
            <p className="text-gray-600 text-lg lg:text-xl max-w-xl leading-relaxed font-medium">
              We provide real-time container shipment calculation, comparative HPP checks across all incoterms, and comprehensive payment security advisors.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="bg-gradient-to-r from-[#0a9b5c] to-[#08824d] hover:from-[#08824d] hover:to-[#06683e] text-white px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 flex items-center space-x-3 group"
              >
                <span>{isNavigating || loading ? "LOADING..." : "GET STARTED NOW"}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center space-x-3 text-sm font-semibold text-gray-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
                </div>
                <span>Trusted by 500+ Exporters</span>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Cards */}
          <div className="w-full lg:w-[480px] flex flex-col space-y-5">
            
            {/* Card 1 */}
            <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-[#0a9b5c]/30 transform transition-all duration-300 hover:-translate-y-2 cursor-pointer flex items-center space-x-5">
              <div className="bg-gradient-to-br from-[#eef5f3] to-white shadow-inner p-4 rounded-xl flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Ship className="text-[#0a9b5c] w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl group-hover:text-[#0a9b5c] transition-colors">Ocean Freight</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Structured sea cargo FCL & LCL services with live rate benchmarking.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-[#0a9b5c]/30 transform transition-all duration-300 hover:-translate-y-2 cursor-pointer flex items-center space-x-5">
              <div className="bg-gradient-to-br from-[#eef5f3] to-white shadow-inner p-4 rounded-xl flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Plane className="text-[#0a9b5c] w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl group-hover:text-[#0a9b5c] transition-colors">Air Cargo</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Lightning fast global air shipments for time-sensitive, high-value goods.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-xl hover:shadow-2xl hover:border-[#0a9b5c]/30 transform transition-all duration-300 hover:-translate-y-2 cursor-pointer flex items-center space-x-5">
              <div className="bg-gradient-to-br from-[#eef5f3] to-white shadow-inner p-4 rounded-xl flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Truck className="text-[#0a9b5c] w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-xl group-hover:text-[#0a9b5c] transition-colors">Road Logistics</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Domestic tracking, secure warehousing, and seamless port delivery.</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ================= SECOND SECTION (FEATURES) ================= */}
      <section className="w-full px-6 lg:px-20 py-32 max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20 space-y-5 max-w-3xl">
          <div className="inline-block bg-[#eef5f3] text-[#0a9b5c] px-4 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase mb-2 border border-[#0a9b5c]/20">
            Integrated Supply Chain Hub
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#022f35] tracking-tight leading-tight">
            Modern Logistics & <br className="hidden md:block" />Export Feasibility Solutions
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed pt-2 max-w-2xl mx-auto">
            We empower national businesses to scale globally through precise costing, transparent shipping routes, and extensive risk assessments.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-24">
          
          {/* Feature 1 */}
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-start text-left hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ShieldCheck className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Risk & Compliance</h3>
            <p className="text-base text-gray-500 leading-relaxed">
              Ensure compliance profiles using country risk index ratings, marine transport stability metrics, currency conversion margins, and default prevention tactics.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-start text-left hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <Calculator className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Incoterms Simulator</h3>
            <p className="text-base text-gray-500 leading-relaxed">
              Instantly retrieve and compare deep commercial margins spanning EXW, FOB, CFR, and CIF rules to maximize your trading profits securely.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-start text-left hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <FileText className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Automated Papers</h3>
            <p className="text-base text-gray-500 leading-relaxed">
              Generate professional trading documents immediately, securing digital Quotations, Proforma Invoices, and structured Export Feasibility reports.
            </p>
          </div>

        </div>

        {/* Dynamic CTA Banner */}
        <div className="w-full relative overflow-hidden rounded-[2.5rem] shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#022f35] via-[#054b42] to-[#0a9b5c] z-0"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay"></div>
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10 text-white">
            <div className="flex-1 space-y-4 max-w-2xl text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Ready to evaluate your export feasibility index?
              </h3>
              <p className="text-[#a4e2cc] text-lg font-medium leading-relaxed">
                Utilize our client portal credentials or register a profile today to access the real-time simulation sandbox. No credit card required.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <button 
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="w-full md:w-auto bg-white hover:bg-gray-100 text-[#022f35] px-10 py-5 rounded-2xl text-base font-extrabold tracking-widest uppercase transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-70 flex items-center justify-center space-x-3 group"
              >
                <span>{isNavigating || loading ? "LOADING..." : "ENTER PORTAL"}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <PublicFooter />

    </div>
  );
}
