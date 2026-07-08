"use client";

import Image from "next/image";
import dashboardBg from "../../public/dashboard-bg.png";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Ship, Plane, Truck } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col font-sans bg-[#f8fcfb] min-h-screen selection:bg-[#0a9b5c]/20">
      <div className="min-h-[60vh] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src={dashboardBg} alt="Dashboard Background" fill priority className="object-cover object-center scale-105" />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#eafaf6]/90 via-white/80 to-[#e3f4f9]/90 backdrop-blur-[4px]"></div>

        <PublicNavbar />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 lg:px-20 max-w-7xl mx-auto w-full py-20 text-center transform transition-all duration-1000 ease-out translate-y-0 opacity-100">
          <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-md border border-[#0a9b5c]/20 shadow-sm px-4 py-2 rounded-full text-xs font-bold text-[#0a9b5c] tracking-widest uppercase mb-6">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a9b5c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0a9b5c]"></span>
            </span>
            <span>Services</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#022f35] leading-[1.15] tracking-tight pb-2 mb-6">
            Our Logistics Solutions
          </h1>
          
          <p className="text-gray-600 text-lg lg:text-xl max-w-2xl leading-relaxed font-medium mx-auto">
            From ocean freight to air cargo and road logistics, we provide comprehensive services tailored to your export needs.
          </p>
        </main>
      </div>

      <section className="w-full px-6 lg:px-20 py-24 max-w-7xl mx-auto flex flex-col items-center relative z-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <Ship className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Ocean Freight</h3>
            <p className="text-base text-gray-500 leading-relaxed">Structured sea cargo FCL & LCL services with competitive pricing.</p>
          </div>
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <Plane className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Air Cargo</h3>
            <p className="text-base text-gray-500 leading-relaxed">Lightning fast global air shipments for time-sensitive deliveries.</p>
          </div>
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <Truck className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-[#0a9b5c] transition-colors">Road Logistics</h3>
            <p className="text-base text-gray-500 leading-relaxed">Domestic tracking, warehousing, and seamless port delivery.</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
