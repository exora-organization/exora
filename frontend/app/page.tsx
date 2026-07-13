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
import heroBg from "../public/dashboard-bg.png";
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

  return (
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">

      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col min-h-[90vh] overflow-hidden">

        {/* Background Image */}
        <Image
          src={heroBg}
          alt="Export Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 z-0" />

        <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto w-full pt-16 pb-20 lg:pt-24 lg:pb-24 gap-12 lg:gap-16">

          {/* Left Column - Copy */}
          <div className="flex-1 space-y-7 max-w-xl mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 bg-[#EBF8F2] text-[#00A651] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-[#00A651]/20">
              <span className="w-2 h-2 rounded-full bg-[#00A651] inline-block" />
              Export Costing &amp; Feasibility Engine
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow">
              Export Feasibility &amp; Decision Support Platform
            </h1>

            <p className="text-white/80 text-base lg:text-lg max-w-lg leading-relaxed">
              Delivering Reliable Logistics Solutions On Time, Every Time. We provide real-time container shipment calculation, comparative HPP checks across all incoterms, and comprehensive payment security advisors.
            </p>

            <div className="pt-2">
              <button
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="inline-flex items-center gap-2 bg-[#00A651] hover:bg-[#008F44] text-white px-7 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {isNavigating || loading ? "Loading..." : "Get Started Now"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column - Service Cards */}
          <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col gap-4">
            {[
              {
                icon: Calculator,
                title: "Export Cost Analysis",
                desc: "Calculate production, logistics, freight, insurance, and certification costs.",
              },
              {
                icon: LineChart,
                title: "Financial Analysis",
                desc: "Measure revenue, profit, ROI, and break-even before exporting.",
              },
              {
                icon: Bot,
                title: "AI Export Advisor",
                desc: "Receive intelligent recommendations based on cost, pricing, and market risk.",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.15 }}
                  className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl px-5 py-4 shadow-lg border border-white/60 hover:bg-white transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#EBF8F2] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#00A651]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#1F2937] text-sm">{card.title}</div>
                    <div className="text-[#6B7280] text-xs mt-0.5">{card.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>


      {/* ================= WHY CHOOSE EXORA ================= */}
      <section className="py-24 px-6 lg:px-20 max-w-none mx-auto w-full bg-gradient-to-b from-[#EBF8F2] to-white">
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
            <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
              Everything you need to evaluate export opportunities, reduce risks, and make confident international trade decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="relative bg-gradient-to-b from-white to-[#EBF8F2]/50 pt-12 px-8 pb-8 rounded-xl border border-[#D1EDE4] shadow-sm hover:shadow-md hover:to-[#EBF8F2] transition-all duration-300 flex flex-col items-center text-center mt-2">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border border-[#D1EDE4] shadow-sm flex items-center justify-center text-[#00A651]">
                    <Icon className="w-6 h-6" />
                    <div className="absolute -bottom-1.5 w-3 h-3 bg-[#00A651] rounded-full border-2 border-white"></div>
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-2">{feature.title}</h3>
                  <p className="text-[#4B5563] leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ================= EXPORT WORKFLOW ================= */}
      <section className="py-24 px-6 lg:px-20 w-full bg-gradient-to-b from-white to-[#EBF8F2]">
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
            <p className="text-[#4B5563] text-lg mt-4 max-w-2xl mx-auto">
              Follow a structured path from registration to generating comprehensive export reports.
            </p>
          </div>

          {/* Timeline for Desktop */}
          <div className="hidden lg:block relative mt-8">

            <div className="grid grid-cols-5 gap-y-12 relative z-10">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#D1EDE4] shadow-sm flex items-center justify-center text-[#00A651] mb-4 relative">
                      <Icon className="w-6 h-6" />
                      {/* Active indicator dot */}
                      <div className="absolute -bottom-1.5 w-3 h-3 bg-[#00A651] rounded-full border-2 border-white"></div>
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
                <div key={idx} className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D1EDE4]">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#EBF8F2] text-[#00A651] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-[#1F2937]">{step.title}</div>
                  {idx !== workflowSteps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-[#4B5563] ml-auto shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-16 px-6 lg:px-20 w-full bg-gradient-to-b from-white to-[#EBF8F2]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-white border border-[#D1EDE4] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
        >
          {/* Left: Text */}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1F2937] leading-tight mb-1">
              Ready to evaluate your export feasibility index?
            </h2>
            <p className="text-[#4B5563] text-sm md:text-base">
              Utilize our client portal credentials or register a profile today to access the real-time simulation sandbox.
            </p>
          </div>

          {/* Right: Button */}
          <div className="shrink-0">
            <button
              onClick={handlePortalClick}
              disabled={isNavigating || loading}
              className="bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 whitespace-nowrap"
            >
              {isNavigating || loading ? "Loading..." : "Enter Client Portal"}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <PublicFooter />

    </div>
  );
}
