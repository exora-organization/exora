"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function ServicesPage() {
  const showcases = [
    {
      title: "Export Cost Analysis",
      desc: "Understand the true cost of every export transaction before making business decisions. EXORA helps you organize and calculate all export-related expenses in one place for better cost control.",
      items: ["Production, packaging, and certification costs", "Freight, insurance, and transportation costs", "Complete export cost breakdown"],
      icon: "solar:calculator-minimalistic-bold-duotone",
      imageLeft: true,
    },
    {
      title: "Pricing Engine",
      desc: "Generate accurate export prices based on international Incoterms while maintaining your desired profit margin. Compare pricing scenarios to stay competitive in global markets.",
      items: ["EXW, FOB, CFR, and CIF pricing", "Target profit margin calculation", "Flexible pricing simulation"],
      icon: "solar:tag-price-bold-duotone",
      imageLeft: false,
    },
    {
      title: "Financial Analysis",
      desc: "Evaluate the financial viability of your export opportunities with clear performance indicators. Make informed decisions using reliable financial projections.",
      items: ["Revenue and profit analysis", "ROI and profit margin calculation", "Break-even point estimation"],
      icon: "solar:graph-up-bold-duotone",
      imageLeft: true,
    },
    {
      title: "Risk Assessment",
      desc: "Identify potential risks before entering international markets. EXORA evaluates multiple risk factors to help you reduce uncertainty and improve decision-making.",
      items: ["Destination country risk analysis", "Payment method evaluation", "Export feasibility assessment"],
      icon: "solar:shield-warning-bold-duotone",
      imageLeft: false,
    },
    {
      title: "AI Export Advisor",
      desc: "Turn complex export data into practical business insights. Receive AI-generated recommendations based on your financial analysis, pricing, and risk evaluation.",
      items: ["Executive summary and insights", "Strategic recommendations", "Go or reconsider decision support"],
      icon: "solar:cpu-bold-duotone",
      imageLeft: true,
    },
    {
      title: "Export Reports",
      desc: "Create professional export reports with a single click. Share clear and structured analyses with management, clients, or business partners.",
      items: ["Export feasibility report", "Financial and cost summary", "Downloadable PDF documents"],
      icon: "solar:document-text-bold-duotone",
      imageLeft: false,
    }
  ];

  return (
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">

      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div
        className="relative flex flex-col overflow-hidden h-[50vh] min-h-[400px] justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`
        }}
      >
        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-lg">
            What EXORA Provides
          </h1>
        </main>
      </div>

      {/* ================= SHOWCASE SECTIONS (TIMELINE) ================= */}
      <section className="py-24 px-6 lg:px-20 max-w-6xl mx-auto w-full relative">
        {/* Center Vertical Line */}
        <div className="absolute left-1/2 top-32 bottom-32 w-[2px] bg-gradient-to-b from-transparent via-[#00A651]/30 to-transparent block transform -translate-x-1/2" />

        <div className="space-y-12 md:space-y-32">
          {showcases.map((showcase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative flex flex-row items-center w-full"
            >
                {/* Icon Container */}
                <div className={`w-1/2 flex ${showcase.imageLeft ? 'justify-end pr-4 md:pr-16 order-1' : 'justify-start pl-4 md:pl-16 order-3'}`}>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-2 border-[#00A651] flex items-center justify-center bg-white shadow-md">
                    <Icon icon={showcase.icon as string} className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 text-[#00A651]" />
                  </div>
                </div>

                {/* Center Node (Number) */}
                <div className="flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center w-6 h-6 md:w-10 md:h-10 rounded-full bg-[#00A651] text-white font-bold text-xs md:text-lg border-2 md:border-4 border-white z-10 shadow-sm order-2">
                  {idx + 1}
                </div>

                {/* Text Container */}
                <div className={`w-1/2 ${showcase.imageLeft ? 'text-left pl-4 md:pl-16 order-3' : 'text-right pr-4 md:pr-16 order-1'}`}>
                  <h3 className="text-[13px] sm:text-xl md:text-2xl font-extrabold text-[#111827] mb-1 md:mb-3">{showcase.title}</h3>
                  <p className="text-[#4B5563] text-[9px] sm:text-[15px] md:text-base leading-snug md:leading-relaxed">
                    {showcase.desc}
                  </p>
                  <div className={`flex w-full ${showcase.imageLeft ? 'justify-start' : 'justify-end'}`}>
                    <ul className="mt-2 md:mt-4 space-y-1 md:space-y-2 text-left inline-block">
                      {showcase.items.map((item, i) => (
                        <li key={i} className="flex items-start text-[#4B5563] text-[8px] sm:text-sm font-medium text-left">
                          <Icon icon="solar:check-circle-linear" className="w-3 h-3 md:w-4 md:h-4 text-[#00A651] shrink-0 mr-1 md:mr-2 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="py-8 px-6 lg:px-20 w-full bg-[#EBF8F2] border-t border-[#D1EDE4]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto bg-white border border-[#D1EDE4] rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-[#1F2937] leading-tight mb-1">
              Ready to leverage these tools?
            </h2>
            <p className="text-[#4B5563] text-sm md:text-base">
              Start evaluating your export cases with precision today.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="/guest-company-application"
              className="bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors shadow-sm whitespace-nowrap inline-flex items-center gap-2"
            >
              Register Your Company
              <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
