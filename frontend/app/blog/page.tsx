"use client";

import Link from "next/link";
import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";
import { BLOG_ARTICLES } from "../../lib/data/blogArticles";

export default function BlogPage() {
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
          {BLOG_ARTICLES.map((article, idx) => (
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
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

                <Link
                  href={`/blog/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#00A651] hover:gap-3 transition-all"
                >
                  Read Article
                  <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
