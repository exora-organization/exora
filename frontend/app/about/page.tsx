"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Target, Lightbulb, Eye, ShieldCheck, Compass, Flag } from "lucide-react";
import Image from "next/image";
import heroBg from "../../public/export_map_hero.png";

export default function AboutPage() {
  const coreValues = [
    {
      title: "Accuracy",
      desc: "Deliver reliable calculations based on standardized export methodologies.",
      icon: Target,
    },
    {
      title: "Innovation",
      desc: "Leverage AI to support smarter business decisions.",
      icon: Lightbulb,
    },
    {
      title: "Transparency",
      desc: "Provide clear financial and risk analysis.",
      icon: Eye,
    },
    {
      title: "Security",
      desc: "Protect company data through secure authentication and role-based access control.",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="flex flex-col font-sans bg-[#FAF8F3] min-h-screen selection:bg-[#2F6B4F]/20">
      
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
            Our Story
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1F2937] leading-[1.1] tracking-tight mb-8">
            About EXORA
          </h1>
          
          <p className="text-[#4B5563] text-lg lg:text-xl leading-relaxed font-medium">
            Building the foundation for sustainable and data-driven export decisions for businesses worldwide.
          </p>
        </main>
      </div>

      {/* ================= WHO WE ARE ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-5xl mx-auto w-full text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-8">Who We Are</h2>
        <div className="space-y-6 text-[#4B5563] text-lg leading-relaxed max-w-4xl mx-auto">
          <p>
            EXORA is a web-based Export Decision Support System designed to help businesses evaluate export opportunities through comprehensive financial analysis, pricing simulation, risk assessment, and AI-powered recommendations.
          </p>
          <p>
            Rather than focusing on transaction execution, EXORA enables companies to make informed export decisions before entering international markets.
          </p>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-6xl mx-auto w-full bg-[#F5F8F6] border border-[#E8E3D9] rounded-3xl my-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Mission */}
          <div className="flex flex-col items-center text-center text-[#1F2937]">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#2F6B4F] flex items-center justify-center mb-6 shadow-sm border border-[#E8E3D9]">
              <Flag className="w-8 h-8" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Our Mission</h3>
            <p className="text-[#4B5563] text-lg leading-relaxed">
              Our mission is to empower businesses with reliable analytical tools that simplify export planning, reduce financial uncertainty, and improve strategic decision-making.
            </p>
          </div>

          {/* Vision */}
          <div className="flex flex-col items-center text-center text-[#1F2937]">
            <div className="w-16 h-16 rounded-2xl bg-white text-[#2F6B4F] flex items-center justify-center mb-6 shadow-sm border border-[#E8E3D9]">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-[#4B5563] text-lg leading-relaxed">
              To become a trusted digital platform that supports sustainable and data-driven export decisions for businesses worldwide.
            </p>
          </div>

        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="py-24 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#FAF8F3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937]">
              Our Core Values
            </h2>
            <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
              The principles that guide our platform and our commitment to our users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="relative bg-white pt-10 px-8 pb-8 rounded-xl border border-[#E8E3D9] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-xl bg-[#2F6B4F] text-white flex items-center justify-center shadow-sm border-2 border-white">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-3">{val.title}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed text-sm">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
