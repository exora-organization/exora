"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { 
  Calculator, 
  Tag, 
  LineChart, 
  GitCompare, 
  ShieldAlert, 
  Bot, 
  LayoutDashboard, 
  FileText 
} from "lucide-react";
import Image from "next/image";
import heroBg from "../../public/export_map_hero.png";

export default function ServicesPage() {
  const services = [
    {
      title: "Export Costing",
      icon: Calculator,
      desc: "Estimate complete export costs including production, packaging, transportation, freight, insurance, and certification.",
      items: ["Production Costs", "Logistics & Freight", "Insurance & Certification"]
    },
    {
      title: "Pricing Engine",
      icon: Tag,
      desc: "Calculate selling prices automatically based on different international commercial terms (Incoterms).",
      items: ["EXW (Ex Works)", "FOB (Free on Board)", "CFR (Cost and Freight)", "CIF (Cost, Insurance & Freight)"]
    },
    {
      title: "Financial Analysis",
      icon: LineChart,
      desc: "Generate comprehensive financial projections to evaluate if the export operation is commercially viable.",
      items: ["Revenue & Profit", "Profit Margin", "Return on Investment (ROI)", "Break Even Point"]
    },
    {
      title: "Scenario Analysis",
      icon: GitCompare,
      desc: "Compare different scenarios to determine the most profitable and secure export strategy.",
      items: ["Incoterm Variants", "Exchange Rate Fluctuations", "Target Margin Adjustments", "Payment Terms"]
    },
    {
      title: "Risk Assessment",
      icon: ShieldAlert,
      desc: "Evaluate critical risk factors that could impact your export operations and profitability.",
      items: ["Country Risk Profile", "Payment Default Risk", "Profitability Risk"]
    },
    {
      title: "AI Export Advisor",
      icon: Bot,
      desc: "Generate AI-based recommendations tailored to your specific export case financial and market data.",
      items: ["Executive Summary", "Key Strengths & Weaknesses", "Critical Risk Factors", "Final Recommendation"]
    },
    {
      title: "Analytics Dashboard",
      icon: LayoutDashboard,
      desc: "Track and visualize your entire export portfolio performance in real-time.",
      items: ["Active Export Cases", "Feasibility Scores", "Risk Distribution Map", "Top Destination Countries"]
    },
    {
      title: "PDF Reports",
      icon: FileText,
      desc: "Generate professional export documents required for international trade and internal reviews.",
      items: ["Commercial Quotation", "Proforma Invoice", "Cost Breakdown Report", "Export Feasibility Report"]
    }
  ];

  return (
    <div className="flex flex-col font-sans bg-[#FAF8F3] min-h-screen selection:bg-[#2F6B4F]/20">
      
      {/* Navbar (now sticky globally) */}
      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col overflow-hidden bg-[#F5F8F6] pt-20 pb-16 lg:pt-28 lg:pb-24">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <Image 
            src={heroBg} 
            alt="Background Map" 
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        
        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center">
          <div className="inline-block bg-[#2F6B4F] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest mb-6">
            Our Features
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1F2937] leading-[1.1] tracking-tight mb-8">
            What EXORA Provides
          </h1>
          
          <p className="text-[#4B5563] text-lg lg:text-xl leading-relaxed font-medium max-w-2xl mx-auto">
            A complete suite of tools to calculate costs, mitigate risks, and execute profitable international trade operations.
          </p>
        </main>
      </div>

      {/* ================= SERVICES GRID ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#FAF8F3] mb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-8 gap-y-16 mt-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div key={idx} className="relative bg-white pt-12 px-8 lg:px-10 pb-10 rounded-2xl border border-[#E8E3D9] shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col items-center text-center h-full">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl bg-[#1F2937] text-white flex items-center justify-center transition-all duration-300 shadow-md border-2 border-white">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-[#1F2937] group-hover:text-[#2F6B4F] transition-colors mt-2 mb-4">{service.title}</h3>
                
                <p className="text-[#4B5563] leading-relaxed mb-8 flex-1">
                  {service.desc}
                </p>
                
                <div className="bg-[#FAF8F3] p-6 rounded-2xl border border-[#2F6B4F]/10 w-full text-left mt-auto">
                  <ul className="space-y-3">
                    {service.items.map((item, i) => (
                      <li key={i} className="flex items-start text-sm font-bold text-[#1F2937]">
                        <span className="text-[#2F6B4F] mr-3 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="py-12 px-6 lg:px-20 max-w-5xl mx-auto w-full mb-20">
        <div className="bg-[#1F2937] rounded-3xl p-12 md:p-16 text-center shadow-xl">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Ready to leverage these tools?
            </h2>
            <p className="text-[#a4e2cc] text-lg font-medium">
              Start evaluating your export cases with precision today.
            </p>
            <div className="pt-6">
              <a 
                href="/company-application"
                className="bg-[#2F6B4F] hover:bg-[#25563F] text-white px-8 py-4 rounded-xl text-lg font-bold transition-colors shadow-lg inline-flex items-center"
              >
                Register Your Company
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
