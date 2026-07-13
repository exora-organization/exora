"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import {
  ArrowRight, CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function ServicesPage() {
  const showcases = [
    {
      title: "Export Cost Analysis",
      desc: "Understand the true cost of every export transaction before making business decisions. EXORA helps you organize and calculate all export-related expenses in one place for better cost control.",
      items: ["Production, packaging, and certification costs", "Freight, insurance, and transportation costs", "Complete export cost breakdown"],
      image: "/service_cost.png",
      imageLeft: true,
    },
    {
      title: "Pricing Engine",
      desc: "Generate accurate export prices based on international Incoterms while maintaining your desired profit margin. Compare pricing scenarios to stay competitive in global markets.",
      items: ["EXW, FOB, CFR, and CIF pricing", "Target profit margin calculation", "Flexible pricing simulation"],
      image: "/service_pricing.png",
      imageLeft: false,
    },
    {
      title: "Financial Analysis",
      desc: "Evaluate the financial viability of your export opportunities with clear performance indicators. Make informed decisions using reliable financial projections.",
      items: ["Revenue and profit analysis", "ROI and profit margin calculation", "Break-even point estimation"],
      image: "/service_financial.png",
      imageLeft: true,
    },
    {
      title: "Risk Assessment",
      desc: "Identify potential risks before entering international markets. EXORA evaluates multiple risk factors to help you reduce uncertainty and improve decision-making.",
      items: ["Destination country risk analysis", "Payment method evaluation", "Export feasibility assessment"],
      image: "/service_risk.png",
      imageLeft: false,
    },
    {
      title: "AI Export Advisor",
      desc: "Turn complex export data into practical business insights. Receive AI-generated recommendations based on your financial analysis, pricing, and risk evaluation.",
      items: ["Executive summary and insights", "Strategic recommendations", "Go or reconsider decision support"],
      image: "/service_ai.png",
      imageLeft: true,
    },
    {
      title: "Export Reports",
      desc: "Create professional export reports with a single click. Share clear and structured analyses with management, clients, or business partners.",
      items: ["Export feasibility report", "Financial and cost summary", "Downloadable PDF documents"],
      image: "/about-image.jpg",
      imageLeft: false,
    }
  ];

  return (
    <div className="flex flex-col font-sans bg-white min-h-screen selection:bg-[#00A651]/20">

      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col overflow-hidden h-[50vh] min-h-[400px] justify-center">
        <Image
          src={heroBg}
          alt="Services Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center">

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-lg">
            What EXORA Provides
          </h1>
        </main>
      </div>

      {/* ================= SHOWCASE SECTIONS ================= */}
      <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto w-full space-y-32">
        {showcases.map((showcase, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`flex flex-col gap-12 lg:gap-20 items-stretch lg:h-[560px] ${
              showcase.imageLeft ? "lg:flex-row" : "lg:flex-row-reverse"
            }`}
          >
            {/* Image Block */}
            <div className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl border-[8px] border-[#EBF8F2] h-[350px] sm:h-[450px] lg:h-full bg-[#EBF8F2]/50 shrink-0 flex items-center justify-center p-4 lg:p-8">
              <img src={`${showcase.image}?v=2`} alt={showcase.title} className="w-full h-full object-contain" />
            </div>

            {/* Text Block */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-5 lg:h-full">
              <div className="inline-flex items-center gap-2 text-[#00A651] text-sm font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#00A651] inline-block" />
                Feature {idx + 1}
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#111827] leading-tight">
                {showcase.title}
              </h2>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                {showcase.desc}
              </p>
              
              <ul className="space-y-4 py-2 mt-2">
                {showcase.items.map((item, i) => (
                  <li key={i} className="flex items-start text-[#1F2937] font-semibold text-lg">
                    <CheckCircle2 className="w-6 h-6 text-[#00A651] shrink-0 mr-3 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
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
              href="/company-application"
              className="bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-colors shadow-sm whitespace-nowrap inline-flex items-center gap-2"
            >
              Register Your Company
              <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
