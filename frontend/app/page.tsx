"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import Image from "next/image";
import { Icon } from "@iconify/react";
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
      title: "Make Smarter Decisions",
      desc: "Evaluate export costs, pricing, profitability, and potential risks before entering international markets. Reduce uncertainty and make informed decisions backed by reliable data.",
      icon: "solar:chart-square-bold-duotone",
    },
    {
      title: "Everything in One Platform",
      desc: "Access every essential export planning tool from costing and financial analysis to AI recommendations and professional reporting in a single, streamlined platform.",
      icon: "solar:settings-bold-duotone",
    },
    {
      title: "AI-Powered Strategic Insights",
      desc: "Transform complex export data into actionable recommendations with AI, helping your business identify opportunities, mitigate risks, and plan with confidence.",
      icon: "solar:cpu-bold-duotone",
    },
  ];

  const workflowSteps = [
    {
      title: "Register",
      desc: "Create an account to access the EXORA portal.",
      icon: "solar:user-circle-bold-duotone",
    },
    {
      title: "Create Export Case",
      desc: "Input your product and shipment details.",
      icon: "solar:case-bold-duotone",
    },
    {
      title: "Financial Analysis",
      desc: "Calculate costs, pricing, and project profitability.",
      icon: "solar:pulse-bold-duotone",
    },
    {
      title: "AI Recommendation",
      desc: "Get smart insights and risk assessments from AI.",
      icon: "solar:lamp-bold-duotone",
    },
    {
      title: "Generate Report",
      desc: "Download a comprehensive feasibility PDF report.",
      icon: "solar:file-check-bold-duotone",
    },
  ];

  const stats = [
    { value: "10+", label: "Export Analysis Features", icon: "solar:pulse-bold-duotone" },
    { value: "4", label: "Supported Incoterms", icon: "solar:global-bold-duotone" },
    { value: "5", label: "User Roles", icon: "solar:users-group-rounded-bold-duotone" },
    { value: "100%", label: "Cloud-Based", icon: "solar:cloud-bold-duotone" },
  ];

  return (
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">

      <PublicNavbar />



      {/* ================= HERO SECTION ================= */}
      <div
        className="relative flex flex-col min-h-[90vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`
        }}
      >

        <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto w-full pt-16 pb-20 lg:pt-24 lg:pb-24 gap-12 lg:gap-16">

          {/* Left Column - Copy */}
          <div className="flex-1 space-y-7 max-w-xl mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 bg-[#EBF8F2] text-[#00A651] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-[#00A651]/20">
              <span className="w-2 h-2 rounded-full bg-[#00A651] inline-block" />
              Your Intelligent Export Decision Platform
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.15] tracking-tight drop-shadow">
              Export Feasibility &amp; Decision Support Platform
            </h1>

            <p className="text-white/90 font-semibold text-base lg:text-lg max-w-lg leading-relaxed">
              Make data driven export decisions through integrated financial analysis, risk assessment, and AI Powered recommendations.
            </p>

            <div className="pt-2">
              <button
                onClick={handlePortalClick}
                disabled={isNavigating || loading}
                className="inline-flex items-center gap-2 bg-[#00A651] hover:bg-[#008F44] text-white px-7 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70"
              >
                {isNavigating || loading ? "Loading..." : "Get Started Now"}
                <Icon icon="solar:alt-arrow-right-bold" className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Right Column - Service Cards */}
          <div className="w-full lg:w-[420px] xl:w-[460px] flex flex-col gap-4">
            {[
              {
                icon: "solar:calculator-bold-duotone",
                title: "Export Cost Analysis",
                desc: "Calculate production, logistics, freight, insurance, and certification costs.",
              },
              {
                icon: "solar:chart-square-bold-duotone",
                title: "Financial Analysis",
                desc: "Measure revenue, profit, ROI, and break-even before exporting.",
              },
              {
                icon: "solar:cpu-bold-duotone",
                title: "AI Export Advisor",
                desc: "Receive intelligent recommendations based on cost, pricing, and market risk.",
              },
            ].map((card, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.15 }}
                  className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-xl px-5 py-4 shadow-lg border border-white/60 hover:bg-white transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center shrink-0">
                    <Icon
                      icon={card.icon as string}
                      className="w-7 h-7 text-[#00A651]"
                    />
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

      {/* ================= STATISTICS ================= */}
      <section className="pt-20 pb-10 px-6 lg:px-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12"
        >
          {stats.map((stat, idx) => {
            return (
              <div key={idx} className="relative bg-white/70 backdrop-blur-md pt-14 px-8 pb-10 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center mt-6 group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-[#00A651] shadow-md flex items-center justify-center group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
                  <Icon icon={stat.icon} className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-extrabold text-[#1F2937] mt-2 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-[#4B5563] uppercase tracking-wide">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </section>

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
              Empowering businesses to make confident export decisions through accurate analysis, integrated planning, and AI-powered insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mt-8">
            {features.map((feature, idx) => {
              return (
                <div key={idx} className="relative bg-white/70 backdrop-blur-md pt-14 px-8 pb-10 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center mt-6 group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-[#00A651] shadow-md flex items-center justify-center group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
                    <Icon
                      icon={feature.icon as string}
                      className="w-8 h-8 text-white"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-3">{feature.title}</h3>
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
          <div className="hidden lg:block relative mt-16 pb-12">

            {/* Wavy Dotted Connecting Line */}
            <div className="absolute top-[40px] -translate-y-1/2 left-[10%] w-[80%] h-32 z-0 hidden lg:block">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 32">
                <path d="M0,16 Q12.5,-4 25,16 T50,16 T75,16 T100,16" fill="none" stroke="#004D26" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="1.5 2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="grid grid-cols-5 gap-x-4 relative z-10">
              {workflowSteps.map((step, idx) => {
                // Organic blob shapes for each step
                const blobRadii = [
                  "60% 40% 30% 70% / 60% 30% 70% 40%",
                  "30% 70% 70% 30% / 30% 30% 70% 70%",
                  "50% 50% 20% 80% / 25% 80% 20% 75%",
                  "40% 60% 70% 30% / 40% 50% 60% 50%",
                  "70% 30% 40% 60% / 60% 60% 40% 40%"
                ];

                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div
                      className="w-20 h-20 bg-[#00A651] text-white flex items-center justify-center mb-6 shadow-md transition-transform hover:scale-105"
                      style={{ borderRadius: blobRadii[idx % 5] }}
                    >
                      <Icon icon={step.icon} className="w-9 h-9 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1F2937] text-lg mb-2">{step.title}</h3>
                    <p className="text-[#6B7280] text-xs leading-relaxed max-w-[140px]">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline for Mobile */}
          <div className="lg:hidden space-y-4">
            {workflowSteps.map((step, idx) => {
              const blobRadii = [
                "60% 40% 30% 70% / 60% 30% 70% 40%",
                "30% 70% 70% 30% / 30% 30% 70% 70%",
                "50% 50% 20% 80% / 25% 80% 20% 75%",
                "40% 60% 70% 30% / 40% 50% 60% 50%",
                "70% 30% 40% 60% / 60% 60% 40% 40%"
              ];
              return (
                <div key={idx} className="flex items-center space-x-5 bg-white p-5 rounded-2xl shadow-sm border border-[#D1EDE4]">
                  <div
                    className="w-14 h-14 shrink-0 bg-[#00A651] text-white flex items-center justify-center shadow-sm"
                    style={{ borderRadius: blobRadii[idx % 5] }}
                  >
                    <Icon icon={step.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1F2937]">{step.title}</h3>
                    <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-16 px-6 lg:px-20 w-full bg-gradient-to-b from-[#EBF8F2] to-white">
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
              <Icon icon="solar:alt-arrow-right-bold" className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= FOOTER ================= */}
      <PublicFooter />

    </div>
  );
}
