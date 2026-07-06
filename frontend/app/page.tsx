"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import Image from "next/image";
import Link from "next/link";
import { Ship, Plane, Truck, ArrowRight } from "lucide-react";
import logoImg from "../public/logo.jpeg";
import dashboardBg from "../public/dashboard-bg.png";

export default function Home() {
  const { role, profile, loading, isAuthenticated, firebaseUser } = useUserProfile();
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
    <div className="flex flex-col font-sans bg-gradient-to-b from-[#eafaf6] via-[#e3f4f9] to-[#dcf0f9] min-h-screen">
      
      {/* ================= HERO SECTION ================= */}
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Graphic (Mockup Style) */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={dashboardBg} 
            alt="Dashboard Background" 
            fill 
            priority
            className="object-cover object-center"
          />
        </div>
        {/* Subtle white overlay to ensure text readability */}
        <div className="absolute inset-0 z-0 bg-white/40 backdrop-blur-[2px]"></div>

        {/* Navbar */}
        <header className="relative z-10 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight text-xl">EXORA</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider">
            <Link href="#" className="text-[#0a9b5c]">HOME</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">ABOUT US</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">SERVICES</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">PROJECTS</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">BLOG</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">CONTACT US</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={handlePortalClick}
              disabled={isNavigating || loading}
              className="bg-[#0a9b5c] hover:bg-[#08824d] text-white px-6 py-2.5 rounded text-sm font-bold tracking-widest uppercase transition-colors shadow-md disabled:opacity-70 flex items-center space-x-2"
            >
              <span>{isNavigating || loading ? "LOADING..." : "CLIENT PORTAL"}</span>
            </button>
          </div>
        </header>

        {/* Hero Section Content */}
        <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto w-full py-12 lg:py-0 gap-12">
          
          {/* Left Column - Copy */}
          <div className="flex-1 space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-gray-200/60 backdrop-blur-sm border border-gray-300/50 px-3 py-1 rounded-full text-xs font-bold text-gray-600 tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span>
              <span>Export Costing & Feasibility Engine</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              Export Feasibility & <br/> Decision Support <br/> Platform
            </h1>
            
            <p className="text-gray-700 text-base lg:text-lg max-w-xl leading-relaxed font-medium">
              Delivering Reliable Logistics Solutions On Time, Every Time. We provide real-time container shipment calculation, comparative HPP checks across all incoterms, and comprehensive payment security advisors.
            </p>
            
            <div className="pt-4">
              <button 
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="bg-[#0a9b5c] hover:bg-[#08824d] text-white px-8 py-4 rounded-md font-bold tracking-widest uppercase transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center space-x-2"
              >
                <span>{isNavigating || loading ? "LOADING..." : "GET STARTED NOW"}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column - Cards */}
          <div className="w-full lg:w-[450px] flex flex-col space-y-4">
            
            {/* Card 1 */}
            <div className="bg-white/90 backdrop-blur-md border border-white/50 p-5 rounded-xl shadow-lg flex items-center space-x-4 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-[#eef5f3] p-3 rounded-lg flex shrink-0 items-center justify-center">
                <Ship className="text-[#0a9b5c] w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Ocean Freight Shipping</h3>
                <p className="text-sm text-gray-500">Structured sea cargo FCL & LCL services.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white/90 backdrop-blur-md border border-white/50 p-5 rounded-xl shadow-lg flex items-center space-x-4 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-[#eef5f3] p-3 rounded-lg flex shrink-0 items-center justify-center">
                <Plane className="text-[#0a9b5c] w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Air Cargo Services</h3>
                <p className="text-sm text-gray-500">Lightning fast global air shipments.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white/90 backdrop-blur-md border border-white/50 p-5 rounded-xl shadow-lg flex items-center space-x-4 transform transition hover:-translate-y-1 hover:shadow-xl">
              <div className="bg-[#eef5f3] p-3 rounded-lg flex shrink-0 items-center justify-center">
                <Truck className="text-[#0a9b5c] w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Road Logistics</h3>
                <p className="text-sm text-gray-500">Domestic tracking and port delivery.</p>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ================= SECOND SECTION (FEATURES) ================= */}
      <section className="w-full px-6 lg:px-20 py-24 pb-32 max-w-7xl mx-auto flex flex-col items-center justify-center relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 max-w-3xl">
          <div className="text-[#0a9b5c] font-bold text-xs tracking-widest uppercase">
            Integrated Supply Chain Hub
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#022f35] tracking-tight">
            Modern Logistics & Export Feasibility Solutions
          </h2>
          <p className="text-gray-500 text-base lg:text-lg leading-relaxed pt-2">
            We empower national businesses to scale globally through precise costing, transparent shipping routes, and extensive risk assessments.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-[#eef5f3] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a9b5c]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">Risk & Compliance Mitigation</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ensure compliance profiles using country risk index ratings, marine transport stability metrics, currency conversion margins, and default prevention tactics.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-[#eef5f3] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a9b5c]">
                <path d="M21.5 12H16c-.7 2-2 3-4 3s-3.3-1-4-3H2.5" />
                <path d="M5.5 5.5A5 5 0 0 1 12 3c3.5 0 6.5 2 6.5 5.5" />
                <path d="M11 21v-4" />
                <path d="M11 11v-4" />
                <path d="m14 14-3-3" />
                <path d="m14 8-3 3" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">Incoterms Multi-Tier Simulation</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Instantly retrieve and compare deep commercial margins spanning EXW (Ex Works), FOB (Free on Board), CFR (Cost & Freight) and CIF (Cost, Insurance & Freight) rules.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl shadow-sm p-8 hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-[#eef5f3] flex items-center justify-center mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a9b5c]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">Automated Commercial Papers</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Generate professional trading documents immediately, securing digital Quotations, Proforma Invoices, and structured Export Feasibility reports.
            </p>
          </div>

        </div>

        {/* CTA Banner */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Ready to evaluate your export feasibility index?
            </h3>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              Utilize our client portal credentials or register a profile today to access the real-time simulation sandbox.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <button 
              onClick={handlePortalClick}
              disabled={isNavigating || loading}
              className="w-full md:w-auto bg-[#0a9b5c] hover:bg-[#08824d] text-white px-8 py-4 rounded-md text-sm font-bold tracking-widest uppercase transition-colors shadow-md disabled:opacity-70"
            >
              {isNavigating || loading ? "LOADING..." : "ENTER CLIENT PORTAL"}
            </button>
          </div>
        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="w-full px-6 lg:px-20 py-16 pb-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start relative z-10">
        <div className="mb-12 md:mb-0 space-y-4">
          <h4 className="font-extrabold text-black text-lg max-w-sm">
            EXORA - Export Feasibility & Decision Support Platform
          </h4>
          <p className="text-xs text-gray-500 pt-2">
            © 2026 EXORA- All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4 md:mr-12">
          <h5 className="font-bold text-gray-700 text-xs tracking-widest uppercase mb-1">
            PORTAL QUICK LINKS
          </h5>
          <Link href="#" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
            About Us
          </Link>
          <Link href="/register" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
            Create New Account
          </Link>
          <Link href="#" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
            Cargo Services
          </Link>
        </div>
      </footer>

    </div>
  );
}
