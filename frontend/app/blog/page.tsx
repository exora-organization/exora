"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function BlogPage() {
  const articles = [
    {
      title: "Understanding Incoterms: EXW, FOB, CFR, and CIF",
      desc: "Learn how different Incoterms influence export pricing, responsibilities, and logistics.",
      category: "Incoterms",
      readTime: "5 min read",
      image: "/blog/blog1.jpg",
    },
    {
      title: "Common Mistakes New Exporters Should Avoid",
      desc: "Discover the financial and operational mistakes that often lead to unsuccessful export projects.",
      category: "Strategy",
      readTime: "7 min read",
      image: "/blog/blog2.jpg",
    },
    {
      title: "How Exchange Rates Affect Export Profitability",
      desc: "Understand how currency fluctuations influence pricing and overall business performance.",
      category: "Finance",
      readTime: "6 min read",
      image: "/blog/blog3.jpg",
    },
    {
      title: "Preparing Financial Data Before Exporting",
      desc: "A practical guide to gathering production costs, logistics expenses, and pricing information.",
      category: "Costing",
      readTime: "8 min read",
      image: "/blog/blog4.jpg",
    },
    {
      title: "Using AI to Support Export Decisions",
      desc: "Learn how AI powered recommendations can assist businesses in evaluating export opportunities.",
      category: "Technology",
      readTime: "4 min read",
      image: "/blog/blog5.jpg",
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
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow">
            Export Insights &amp; Resources
          </h1>
        </main>
      </div>

      {/* ================= ARTICLES GRID ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#EBF8F2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="bg-white rounded-2xl border border-[#D1EDE4] shadow-sm hover:shadow-lg hover:border-[#00A651] transition-all duration-300 group flex flex-col overflow-hidden h-full"
            >
              <div className="w-full h-44 bg-[#EBF8F2] relative flex items-center justify-center overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-7 flex flex-col flex-1 border-t-4 border-[#00A651]">
                <div className="flex items-center space-x-4 mb-4 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  <div className="flex items-center text-[#00A651] bg-[#EBF8F2] px-2 py-1 rounded-md">
                    <Icon icon="solar:tag-bold-duotone" className="w-3 h-3 mr-1" />
                    {article.category}
                  </div>
                  <div className="flex items-center">
                    <Icon icon="solar:clock-circle-bold-duotone" className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[#1F2937] mb-3 group-hover:text-[#00A651] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-[#6B7280] text-sm leading-relaxed mb-6 flex-1">
                  {article.desc}
                </p>


              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
