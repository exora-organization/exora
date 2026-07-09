"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import Image from "next/image";
import { 
  ArrowRight, Calculator, FileText, Globe, Tag, LineChart, ShieldAlert, Bot,
  CheckCircle2, Building, Users, Briefcase, DollarSign, Activity, AlertTriangle, 
  Lightbulb, FileCheck, Cloud, LayoutDashboard, Map
} from "lucide-react";
import { motion } from "framer-motion";
import dashboardBg from "../public/export_map_hero.png";
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

  const features = [
    {
      title: "Export Cost Analysis",
      desc: "Calculate production, logistics, freight, insurance, and certification costs accurately.",
      icon: DollarSign,
    },
    {
      title: "Pricing Engine",
      desc: "Generate export prices using EXW, FOB, CFR, and CIF based on Incoterms.",
      icon: Tag,
    },
    {
      title: "Financial Insights",
      desc: "Evaluate revenue, profit, ROI, margin, and break-even point before exporting.",
      icon: LineChart,
    },
    {
      title: "Risk Assessment",
      desc: "Analyze destination country risks, payment methods, and profitability.",
      icon: ShieldAlert,
    },
    {
      title: "AI Export Advisor",
      desc: "Receive AI-powered recommendations based on financial and market analysis.",
      icon: Bot,
    },
    {
      title: "Export Reports",
      desc: "Generate professional export feasibility reports in PDF format.",
      icon: FileText,
    },
  ];

  const workflowSteps = [
    { title: "Company Registration", icon: Building },
    { title: "Admin Approval", icon: CheckCircle2 },
    { title: "Invite Team", icon: Users },
    { title: "Create Export Case", icon: Briefcase },
    { title: "Costing", icon: Calculator },
    { title: "Pricing", icon: Tag },
    { title: "Financial Analysis", icon: Activity },
    { title: "Risk Assessment", icon: AlertTriangle },
    { title: "AI Recommendation", icon: Lightbulb },
    { title: "Export Report", icon: FileCheck },
  ];

  const stats = [
    { value: "10+", label: "Export Analysis Features", icon: Activity },
    { value: "4", label: "Supported Incoterms", icon: Globe },
    { value: "5", label: "User Roles", icon: Users },
    { value: "100%", label: "Cloud-Based", icon: Cloud },
  ];
  return (
    <div className="flex flex-col font-sans bg-[#FAF8F3] min-h-screen selection:bg-[#2F6B4F]/20">
      
      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col min-h-[90vh] overflow-hidden bg-[#F5F8F6]">

        <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto w-full pt-12 pb-24 lg:py-0 lg:pb-32 gap-12 lg:gap-20">
          
          {/* Left Column - Copy */}
          <div className="flex-1 space-y-8 max-w-2xl mt-8 lg:mt-0">
            <div className="inline-block bg-[#2F6B4F] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              AI-Powered Export Decision Platform
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#1F2937] leading-[1.15] tracking-tight">
              Make Smarter Export Decisions with <span className="text-[#2F6B4F]">Confidence</span>
            </h1>
            
            <p className="text-[#4B5563] text-lg lg:text-xl max-w-xl leading-relaxed font-medium">
              Analyze export costs, pricing, financial performance, and market risks in one platform. EXORA helps businesses evaluate export feasibility before making international trade decisions.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="w-full sm:w-auto bg-[#2F6B4F] hover:bg-[#25563F] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center space-x-2"
              >
                <span>{isNavigating || loading ? "Loading..." : "Get Started"}</span>
                <ArrowRight size={20} />
              </button>
              <button 
                className="w-full sm:w-auto bg-white border border-[#2F6B4F] text-[#2F6B4F] hover:bg-[#F5F8F6] px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column - Hero Illustration */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-[650px] aspect-[4/3] rounded-2xl border border-[#E8E3D9] shadow-lg overflow-hidden bg-white">
              <Image 
                src={dashboardBg} 
                alt="EXORA Dashboard Analytics" 
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </main>
        
        {/* SVG Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FAF8F3"></path>
          </svg>
        </div>
      </div>

      {/* ================= WHY CHOOSE EXORA ================= */}
      <section className="py-24 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#FAF8F3]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1F2937]">
              Why Businesses Choose EXORA
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
              Everything you need to evaluate, plan, and execute successful export operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="relative bg-white pt-12 px-8 pb-8 rounded-xl border border-[#E8E3D9] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#2F6B4F] text-white flex items-center justify-center shadow-sm border-2 border-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">{feature.title}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ================= EXPORT WORKFLOW ================= */}
      <section className="py-24 px-6 lg:px-20 w-full bg-[#FAF8F3] border-t border-[#E8E3D9]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1F2937]">
              Seamless Export Workflow
            </h2>
            <p className="text-[#9CA3AF] text-lg mt-4 max-w-2xl mx-auto">
              Follow a structured path from registration to generating comprehensive export reports.
            </p>
          </div>

          {/* Timeline for Desktop */}
          <div className="hidden lg:block relative mt-8">
            {/* Connecting Line */}
            <div className="absolute top-8 left-10 right-10 h-0.5 bg-gray-200"></div>
            
            <div className="grid grid-cols-5 gap-y-12 relative z-10">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#E8E3D9] shadow-sm flex items-center justify-center text-[#2F6B4F] mb-4 relative">
                      <Icon className="w-6 h-6" />
                      {/* Active indicator dot */}
                      <div className="absolute -bottom-1.5 w-3 h-3 bg-[#2F6B4F] rounded-full border-2 border-white"></div>
                    </div>
                    <span className="font-semibold text-[#1F2937] text-sm max-w-[120px]">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline for Mobile */}
          <div className="lg:hidden space-y-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm border border-[#E8E3D9]">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#F5F8F6] text-[#2F6B4F] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-gray-800">{step.title}</div>
                  {idx !== workflowSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="py-20 px-6 lg:px-20 w-full bg-[#FAF8F3] border-t border-[#E8E3D9]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 mt-8"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center pt-10 px-6 pb-6 bg-white rounded-xl border border-[#E8E3D9] shadow-sm">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#2F6B4F] flex items-center justify-center text-white border-2 border-white shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-extrabold text-[#1F2937] mt-2 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-[#4B5563] uppercase tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-12 px-6 lg:px-20 max-w-5xl mx-auto w-full mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="bg-[#F5F8F6] border border-[#E8E3D9] rounded-3xl p-12 md:p-16 text-center shadow-sm"
        >
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1F2937] leading-tight">
              Ready to Evaluate Your Next Export Opportunity?
            </h2>
            <p className="text-[#4B5563] text-lg md:text-xl font-medium">
              Join leading businesses streamlining their export operations with EXORA.
            </p>
            <div className="pt-6">
              <button 
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="bg-[#2F6B4F] hover:bg-[#25563F] text-white px-10 py-5 rounded-xl text-lg font-bold transition-colors shadow-sm disabled:opacity-70 inline-flex items-center space-x-3"
              >
                <span>{isNavigating || loading ? "Loading..." : "Start Free"}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <PublicFooter />

    </div>
  );
}
