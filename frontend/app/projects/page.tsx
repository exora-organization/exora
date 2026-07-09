"use client";

import Image from "next/image";
import dashboardBg from "../../public/export_map_hero.png";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col font-sans bg-[#FAF8F3] min-h-screen selection:bg-[#2F6B4F]/20">
      <div className="min-h-[60vh] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={dashboardBg} alt="Dashboard Background" fill priority className="object-cover object-center scale-105" />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#FAF8F3]/90 via-white/80 to-[#F5F8F6]/90 backdrop-blur-[4px]"></div>

        <PublicNavbar />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-20 max-w-7xl mx-auto w-full py-20 text-center transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
          <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-md border border-[#0a9b5c]/20 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-[#0a9b5c] tracking-widest uppercase mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F6B4F] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2F6B4F]"></span>
            </span>
            <span>Projects</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#022f35] leading-[1.15] tracking-tight pb-2 mb-6">
            Our Successful Ventures
          </h1>
          
          <p className="text-[#4B5563] text-lg lg:text-xl max-w-2xl leading-relaxed font-medium mx-auto">
            Explore our portfolio of successful export projects, feasibility studies, and global logistics achievements.
          </p>
        </main>
      </div>

      <section className="w-full px-6 lg:px-20 py-24 max-w-7xl mx-auto flex flex-col items-center relative z-10 flex-1">
        <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#E8E3D9] hover:border-[#0a9b5c]/20 p-8 md:p-16 w-full flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#F5F8F6] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
          <h2 className="text-3xl font-extrabold text-[#1F2937] mb-6 group-hover:text-[#0a9b5c] transition-colors">Featured Projects</h2>
          <p className="text-[#9CA3AF] text-center max-w-2xl text-lg leading-relaxed">
            A showcase of our most impactful case studies and client success stories will be featured here soon.
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
