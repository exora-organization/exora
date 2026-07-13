"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Target, Lightbulb, Eye, ShieldCheck, Flag, Compass, Activity, Globe, Users, Cloud, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function AboutPage() {
  const stats = [
    { value: "10+", label: "Export Analysis Features", icon: Activity },
    { value: "4", label: "Supported Incoterms", icon: Globe },
    { value: "5", label: "User Roles", icon: Users },
    { value: "100%", label: "Cloud-Based", icon: Cloud },
  ];

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
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">

      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col overflow-hidden h-[50vh] min-h-[400px] justify-center">
        {/* Background Image */}
        <Image
          src={heroBg}
          alt="About Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

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
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-6">Why EXORA Exists</h2>
            <div className="space-y-6 text-[#4B5563] text-lg leading-relaxed">
              <p>
                EXORA is a web-based Export Decision Support System that
                helps businesses evaluate international trade opportunities
                through integrated cost analysis, pricing simulation,
                financial insights, risk assessment, and AI-powered
                recommendations.
              </p>
              <p>
                Instead of focusing on transaction execution, EXORA
                empowers companies to assess export feasibility,
                reduce potential risks, and make informed decisions
                before entering global markets.
              </p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-center gap-3 font-semibold text-[#1F2937]"><CheckCircle2 className="w-6 h-6 text-[#00A651]" /> Data-Driven Decisions</li>
                <li className="flex items-center gap-3 font-semibold text-[#1F2937]"><CheckCircle2 className="w-6 h-6 text-[#00A651]" /> AI-Powered Insights</li>
                <li className="flex items-center gap-3 font-semibold text-[#1F2937]"><CheckCircle2 className="w-6 h-6 text-[#00A651]" /> Global Market Readiness</li>
              </ul>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl h-[300px] lg:h-[500px] w-full bg-gray-200">
            <img src="/about-us.png" alt="Who We Are" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </section>

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
            const Icon = stat.icon;
            return (
              <div key={idx} className="relative flex flex-col items-center text-center pt-10 px-6 pb-6 bg-white rounded-xl border border-[#D1EDE4] shadow-sm">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#00A651] flex items-center justify-center text-white border-2 border-white shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-extrabold text-[#1F2937] mt-2 mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-[#4B5563] uppercase tracking-wide">{stat.label}</div>
              </div>
            );
          })}
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
            Our Mission & Vision
          </h2>
          <div className="flex flex-col items-center mt-5 space-y-1.5">
            <div className="w-24 h-1 bg-[#1F2937]"></div>
            <div className="w-24 h-1 bg-[#8CC63F]"></div>
          </div>
        </motion.div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-8">

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center w-full relative"
          >
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 z-10 border-[6px] border-[#EBF8F2] shadow-lg relative bg-white sm:-mr-10 mb-[-3rem] sm:mb-0">
              <Image src="/about-image.jpg" alt="Mission" fill className="object-cover grayscale brightness-90" />
            </div>
            <div className="bg-[#F3F4F6] w-full rounded-3xl sm:rounded-l-none sm:pl-16 pr-8 py-10 shadow-sm relative pt-16 sm:pt-10 text-center sm:text-left">
              <h3 className="text-2xl font-extrabold text-[#111827] mb-3">Mission</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Our mission is to empower businesses with reliable analytical tools that simplify export planning, reduce financial uncertainty, and improve strategic decision-making.
              </p>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col-reverse sm:flex-row items-center w-full relative"
          >
            <div className="bg-[#F3F4F6] w-full rounded-3xl sm:rounded-r-none pl-8 sm:pr-16 py-10 shadow-sm text-center sm:text-right relative pb-16 sm:pb-10 pt-10">
              <h3 className="text-2xl font-extrabold text-[#111827] mb-3">Vision</h3>
              <p className="text-[#4B5563] leading-relaxed">
                To become a trusted digital platform that supports sustainable and data-driven export decisions for businesses worldwide.
              </p>
            </div>
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 z-10 border-[6px] border-[#EBF8F2] shadow-lg relative bg-[#8CC63F] sm:-ml-10 mb-[-3rem] sm:mb-0">
              <div className="absolute inset-0 bg-[#8CC63F]/40 mix-blend-multiply z-10"></div>
              <Image src="/dashboard-bg.png" alt="Vision" fill className="object-cover grayscale" />
            </div>
          </motion.div>

        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="pt-10 pb-24 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#EBF8F2]">
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
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="relative bg-white pt-12 px-8 pb-8 rounded-xl border border-[#D1EDE4] hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-[#00A651] text-white flex items-center justify-center shadow-sm border-2 border-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937] mb-3">{val.title}</h3>
                  <p className="text-[#4B5563] leading-relaxed text-sm">{val.desc}</p>
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
