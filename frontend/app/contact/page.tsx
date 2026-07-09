"use client";

import Image from "next/image";
import dashboardBg from "../../public/dashboard-bg.png";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
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
            <span>Contact Us</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#022f35] leading-[1.15] tracking-tight pb-2 mb-6">
            Get In Touch
          </h1>
          
          <p className="text-gray-600 text-lg lg:text-xl max-w-2xl leading-relaxed font-medium mx-auto">
            Have questions about our export feasibility platform or logistics solutions? Our team is ready to help.
          </p>
        </main>
      </div>

      <section className="w-full px-6 lg:px-20 py-24 max-w-7xl mx-auto flex flex-col items-center relative z-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto">
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <Mail className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-[#0a9b5c] transition-colors">Email Us</h3>
            <p className="text-base text-gray-500">support@exora.com</p>
          </div>
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <Phone className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-[#0a9b5c] transition-colors">Call Us</h3>
            <p className="text-base text-gray-500">+1 (555) 123-4567</p>
          </div>
          <div className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl p-10 transition-all duration-500 border border-gray-100 hover:border-[#0a9b5c]/20 flex flex-col items-center text-center hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#eef5f3] to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0a9b5c] to-[#08824d] shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
               <MapPin className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-[#0a9b5c] transition-colors">Visit Us</h3>
            <p className="text-base text-gray-500">Global Headquarters</p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
