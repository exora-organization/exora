"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import heroBg from "../../public/export_map_hero.png";

export default function BlogPage() {
  const articles = [
    {
      title: "Understanding Incoterms: EXW, FOB, CFR, and CIF",
      desc: "Learn how different Incoterms influence export pricing, responsibilities, and logistics.",
      category: "Incoterms",
      readTime: "5 min read",
    },
    {
      title: "Common Mistakes New Exporters Should Avoid",
      desc: "Discover the financial and operational mistakes that often lead to unsuccessful export projects.",
      category: "Strategy",
      readTime: "7 min read",
    },
    {
      title: "How Exchange Rates Affect Export Profitability",
      desc: "Understand how currency fluctuations influence pricing and overall business performance.",
      category: "Finance",
      readTime: "6 min read",
    },
    {
      title: "Preparing Financial Data Before Exporting",
      desc: "A practical guide to gathering production costs, logistics expenses, and pricing information.",
      category: "Costing",
      readTime: "8 min read",
    },
    {
      title: "Using AI to Support Export Decisions",
      desc: "Learn how AI-powered recommendations can assist businesses in evaluating export opportunities.",
      category: "Technology",
      readTime: "4 min read",
    }
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
            EXORA Blog
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1F2937] leading-[1.1] tracking-tight mb-8">
            Export Insights & Resources
          </h1>
          
          <p className="text-[#4B5563] text-lg lg:text-xl leading-relaxed font-medium max-w-2xl mx-auto">
            Stay informed with practical knowledge about export planning, international trade, pricing strategies, and market risks.
          </p>
        </main>
      </div>

      {/* ================= ARTICLES GRID ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#FAF8F3] mb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <div key={idx} className="bg-white rounded-[2rem] border border-[#E8E3D9] shadow-sm hover:shadow-lg hover:border-[#2F6B4F] transition-all duration-300 group flex flex-col overflow-hidden h-full">
              <div className="w-full h-48 bg-[#F5F8F6] relative flex items-center justify-center overflow-hidden">
                <BookOpen className="w-12 h-12 text-[#2F6B4F] group-hover:scale-110 group-hover:text-white transition-all duration-500" />
              </div>
              
              <div className="p-8 flex flex-col flex-1 border-t-4 border-[#2F6B4F]">
                <div className="flex items-center space-x-4 mb-4 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  <div className="flex items-center text-[#2F6B4F] bg-[#FAF8F3] px-2 py-1 rounded-md">
                    <Tag className="w-3 h-3 mr-1" />
                    {article.category}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-[#1F2937] mb-3 group-hover:text-[#2F6B4F] transition-colors leading-snug">
                  {article.title}
                </h3>
                
                <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6 flex-1">
                  {article.desc}
                </p>
                
                <div className="pt-4 mt-auto border-t border-[#E8E3D9] flex items-center text-[#2F6B4F] font-bold text-sm cursor-pointer hover:text-[#25563F] transition-colors">
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
