"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function AboutPage() {
  const coreValues = [
    {
      title: "Accuracy",
      desc: "Deliver reliable calculations based on standardized export methodologies.",
      icon: "solar:target-bold-duotone",
    },
    {
      title: "Innovation",
      desc: "Leverage AI to support smarter business decisions.",
      icon: "solar:lamp-bold-duotone",
    },
    {
      title: "Transparency",
      desc: "Provide clear financial and risk analysis.",
      icon: "solar:eye-bold-duotone",
    },
    {
      title: "Security",
      desc: "Protect company data through secure authentication and role-based access control.",
      icon: "solar:shield-check-bold-duotone",
    },
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

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow">
            About EXORA
          </h1>
        </main>
      </div>

      {/* ================= WHO WE ARE ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center"
        >
          <div className="lg:col-span-7 xl:col-span-8">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-6">Why EXORA Exists?</h2>
            <div className="space-y-6 text-[#4B5563] text-lg leading-relaxed">
              <p>
                EXORA is a Web Based Export Decision Support System that
                helps businesses evaluate international trade opportunities
                through integrated cost analysis, pricing simulation,
                financial insights, risk assessment, and AI powered
                recommendations.
              </p>
              <p>
                Instead of focusing on transaction execution, EXORA
                empowers companies to assess export feasibility,
                reduce potential risks, and make informed decisions
                before entering global markets.
              </p>
              <ul className="flex flex-wrap gap-3 lg:gap-5 mt-6">
                <li className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F2937]"><Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-[#00A651]" /> Data-Driven Decisions</li>
                <li className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F2937]"><Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-[#00A651]" /> AI Powered Insights</li>
                <li className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F2937]"><Icon icon="solar:check-circle-bold-duotone" className="w-4 h-4 text-[#00A651]" /> Global Market Readiness</li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl h-[250px] lg:h-[350px] w-full max-w-sm border border-[#D1EDE4] bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(/worldmap.jpeg)`
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="pt-10 pb-10 px-6 lg:px-20 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Heading Centered */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12 mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#111827] leading-tight">
            Our Vision and Mission
          </h2>
          <div className="flex flex-col items-center mt-5 space-y-1.5">
            <div className="w-24 h-1 bg-[#1F2937]"></div>
            <div className="w-24 h-1 bg-[#8CC63F]"></div>
          </div>
        </motion.div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-8">

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center w-full relative group hover:-translate-y-1.5 transition-transform duration-500"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shrink-0 z-10 border-8 border-white shadow-sm relative bg-[#00A651] sm:-mr-10 mb-[-3rem] sm:mb-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-500">
              <span className="text-white font-extrabold text-xl md:text-2xl tracking-widest uppercase">Vision</span>
            </div>
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 w-full rounded-3xl sm:rounded-l-none sm:pl-16 pr-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:shadow-[0_20px_40px_rgb(0,166,81,0.12)] transition-all duration-500 relative pt-16 sm:pt-10 text-center sm:text-left">
              <p className="text-[#4B5563] leading-relaxed font-semibold md:text-lg">
                To become a trusted digital platform that supports sustainable and data-driven export decisions for businesses worldwide.
              </p>
            </div>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col-reverse sm:flex-row items-center w-full relative group hover:-translate-y-1.5 transition-transform duration-500"
          >
            <div className="bg-white/90 backdrop-blur-xl border border-white/60 w-full rounded-3xl sm:rounded-r-none pl-8 sm:pr-16 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:shadow-[0_20px_40px_rgb(0,166,81,0.12)] transition-all duration-500 text-center sm:text-right relative pb-16 sm:pb-10 pt-10">
              <p className="text-[#4B5563] leading-relaxed font-semibold md:text-lg">
                Our mission is to empower businesses with reliable analytical tools that simplify export planning, reduce financial uncertainty, and improve strategic decision-making.
              </p>
            </div>
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center shrink-0 z-10 border-8 border-white shadow-sm relative bg-[#00A651] sm:-ml-10 mb-[-3rem] sm:mb-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-500">
              <span className="text-white font-extrabold text-xl md:text-2xl tracking-widest uppercase">Mission</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="pt-10 pb-24 px-6 lg:px-20 max-w-none mx-auto w-full bg-gradient-to-b from-[#EBF8F2] to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937]">
              Our Core Values
            </h2>
            <p className="text-[#4B5563] text-lg max-w-2xl mx-auto">
              The principles that guide our platform and our commitment to our users.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8">
            {coreValues.map((val, idx) => {
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative bg-white/90 backdrop-blur-xl pt-10 px-5 pb-7 rounded-3xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgb(0,166,81,0.1)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col items-center text-center mt-8 group"
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-[1rem] bg-[#EBF8F2] border-4 border-white shadow-sm flex items-center justify-center group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-500">
                    <Icon icon={val.icon} className="w-7 h-7 text-[#00A651] group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#1F2937] group-hover:text-[#00A651] transition-colors duration-300 mb-2 mt-2">{val.title}</h3>
                  <p className="text-sm font-medium text-[#4B5563] leading-relaxed">{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
