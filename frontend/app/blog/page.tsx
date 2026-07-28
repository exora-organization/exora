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
        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center space-y-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#00A651] bg-[#00A651]/10 border border-[#00A651]/30 px-4 py-1.5 rounded-full uppercase tracking-widest">
            <Icon icon="solar:document-text-bold-duotone" className="w-4 h-4" />
            Export Knowledge Hub
          </span>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow">
            Export Insights &amp; Resources
          </h1>
          <p className="text-gray-300 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
            Practical, data-backed articles to help exporters navigate Incoterms, financial costing, foreign exchange risks, and AI-powered trade decisions.
          </p>
        </main>
      </div>

      {/* ================= ARTICLES GRID ================= */}
      <section className="py-20 px-6 lg:px-20 max-w-none mx-auto w-full bg-[#EBF8F2]">
        <div className="max-w-7xl mx-auto">
          {/* Featured First Article */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Link href={`/blog/${BLOG_ARTICLES[0].slug}`} className="group block">
              <div className="bg-white rounded-3xl border border-[#D1EDE4] shadow-sm hover:shadow-xl hover:border-[#00A651] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden bg-[#EBF8F2]">
                  <Image
                    src={BLOG_ARTICLES[0].image}
                    alt={BLOG_ARTICLES[0].title}
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5" />
                </div>
                <div className="p-8 sm:p-10 flex flex-col justify-center border-l-4 border-[#00A651]">
                  <div className="flex items-center gap-4 mb-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <span className="bg-[#EBF8F2] text-[#00A651] px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Icon icon="solar:tag-bold-duotone" className="w-3 h-3" />
                      {BLOG_ARTICLES[0].category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:clock-circle-bold-duotone" className="w-3 h-3" />
                      {BLOG_ARTICLES[0].readTime}
                    </span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Featured</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1F2937] group-hover:text-[#00A651] transition-colors leading-snug mb-4">
                    {BLOG_ARTICLES[0].title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {BLOG_ARTICLES[0].desc}
                  </p>
                  <div className="flex items-center gap-2 text-[#00A651] text-sm font-black group-hover:gap-4 transition-all">
                    Read Full Article
                    <Icon icon="solar:arrow-right-bold-duotone" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Remaining Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BLOG_ARTICLES.slice(1).map((article, idx) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  href={`/blog/${article.slug}`}
                  className="bg-white rounded-2xl border border-[#D1EDE4] shadow-sm hover:shadow-lg hover:border-[#00A651] transition-all duration-300 group flex flex-col overflow-hidden h-full block"
                >
                  <div className="w-full h-44 bg-[#EBF8F2] relative flex items-center justify-center overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex flex-col flex-1 border-t-4 border-[#00A651]">
                    <div className="flex items-center space-x-3 mb-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      <div className="flex items-center text-[#00A651] bg-[#EBF8F2] px-2 py-1 rounded-md">
                        <Icon icon="solar:tag-bold-duotone" className="w-3 h-3 mr-1" />
                        {article.category}
                      </div>
                      <div className="flex items-center">
                        <Icon icon="solar:clock-circle-bold-duotone" className="w-3 h-3 mr-1" />
                        {article.readTime}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-[#1F2937] mb-2 group-hover:text-[#00A651] transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-[#6B7280] text-xs leading-relaxed mb-5 flex-1">
                      {article.desc}
                    </p>

                    <div className="flex items-center gap-1.5 text-[#00A651] text-xs font-black group-hover:gap-3 transition-all">
                      Read Article
                      <Icon icon="solar:arrow-right-bold-duotone" className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Educational Disclaimer */}
          <div className="mt-16 flex items-start gap-4 p-6 bg-white/70 border border-[#D1EDE4] rounded-2xl text-sm text-gray-600">
            <Icon icon="solar:info-circle-bold-duotone" className="w-5 h-5 text-[#00A651] shrink-0 mt-0.5" />
            <p>
              <span className="font-bold text-[#1F2937]">Educational Content Notice: </span>
              All articles on this platform are intended for informational and educational purposes. Sources are curated from internationally recognized trade standards bodies including the ICC, ITC, WTO, IMF, and Bank Indonesia. Always consult your licensed freight forwarder, trade lawyer, or financial advisor before executing international trade transactions.
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
