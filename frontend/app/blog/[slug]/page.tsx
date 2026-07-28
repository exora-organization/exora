"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Icon } from "@iconify/react";
import { BLOG_ARTICLES } from "../../../lib/data/blogArticles";
import { PublicNavbar } from "../../../components/public/PublicNavbar";
import { PublicFooter } from "../../../components/public/PublicFooter";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#EBF8F2] flex flex-col justify-between">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center p-12 text-center my-auto">
          <Icon icon="solar:danger-circle-bold-duotone" className="w-16 h-16 text-rose-500 mb-4" />
          <h1 className="text-3xl font-extrabold text-[#1F2937] mb-2">Article Not Found</h1>
          <p className="text-gray-600 mb-6 max-w-md">The requested export insight article could not be found or has been moved.</p>
          <Link
            href="/blog"
            className="px-6 py-3 bg-[#00A651] text-white font-bold text-sm rounded-full hover:bg-[#008F44] transition-all shadow-md"
          >
            ← Back to All Articles
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const otherArticles = BLOG_ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">
      <PublicNavbar />

      {/* Hero Header */}
      <div className="bg-[#0C1E1C] text-white pt-32 pb-20 px-6 lg:px-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <button
            onClick={() => router.push("/blog")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00A651] bg-[#00A651]/10 px-4 py-2 rounded-full border border-[#00A651]/30 hover:bg-[#00A651]/20 transition-all cursor-pointer"
          >
            <Icon icon="solar:arrow-left-bold" className="w-4 h-4" />
            Back to Export Insights
          </button>

          <div className="flex items-center gap-4 text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">
            <span className="bg-[#00A651] text-white px-3 py-1 rounded-full">{article.category}</span>
            <span>{article.readTime}</span>
            <span>·</span>
            <span>{article.publishedAt}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-gray-300 font-medium leading-relaxed">
            {article.desc}
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10 text-xs font-semibold text-gray-400">
            <div className="w-8 h-8 rounded-full bg-[#00A651] flex items-center justify-center text-white font-extrabold">
              EX
            </div>
            <div>
              <p className="text-white font-bold">{article.author}</p>
              <p className="text-[10px] text-gray-400">Verified Educational Trade Advisory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full space-y-10">

        {/* Featured Image */}
        <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-white/60">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Key Takeaways Box */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xl border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Icon icon="solar:lightbulb-bold-duotone" className="w-5 h-5 text-[#00A651]" />
              </div>
              <h2 className="text-lg font-black text-[#1F2937]">Key Educational Takeaways</h2>
            </div>
            <ul className="space-y-2.5">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-semibold text-gray-700">
                  <Icon icon="solar:check-circle-bold" className="w-4 h-4 text-[#00A651] shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Markdown Content Body */}
        <article className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="prose prose-slate max-w-none text-gray-800 text-sm sm:text-base leading-relaxed font-medium">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] mt-8 mb-4 pb-2 border-b border-gray-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1F2937] mt-6 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 leading-relaxed my-3 font-medium text-sm sm:text-base">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 my-4 pl-2">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 font-semibold my-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] mt-2 shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200">
                    <table className="w-full text-xs sm:text-sm text-left">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-[#F8FAFC] text-gray-900 font-extrabold border-b border-gray-200 uppercase text-[11px] tracking-wider">
                    {children}
                  </thead>
                ),
                th: ({ children }) => <th className="px-4 py-3 font-extrabold">{children}</th>,
                td: ({ children }) => <td className="px-4 py-3 border-b border-gray-100 font-medium">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="p-4 my-4 bg-emerald-50 border-l-4 border-[#00A651] rounded-r-2xl text-xs sm:text-sm text-emerald-900 font-medium italic">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-extrabold text-[#1F2937]">{children}</strong>,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Verified Educational Sources & Citations */}
        {article.sources && article.sources.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Icon icon="solar:bookmark-bold-duotone" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-[#1F2937] text-base">Verified Educational References & Sources</h3>
                <p className="text-xs text-gray-500 font-medium">Curated from international trade governance organizations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {article.sources.map((src, i) => (
                <div key={i} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-[#00A651] uppercase tracking-widest block mb-1">
                      {src.org}
                    </span>
                    <p className="text-xs font-extrabold text-[#1F2937] leading-snug">{src.title}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-gray-400">
                    <Icon icon="solar:verified-check-bold" className="w-3.5 h-3.5 text-blue-500" />
                    <span>Official Standard</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles Navigation */}
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-black text-[#1F2937]">More Educational Export Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherArticles.map((rel, idx) => (
              <Link
                key={idx}
                href={`/blog/${rel.slug}`}
                className="bg-white rounded-2xl border border-[#D1EDE4] shadow-sm hover:shadow-lg hover:border-[#00A651] transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="w-full h-36 relative overflow-hidden bg-gray-100">
                  <Image
                    src={rel.image}
                    alt={rel.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 border-t-2 border-[#00A651]">
                  <span className="text-[10px] font-bold text-[#00A651] uppercase tracking-widest mb-1">
                    {rel.category}
                  </span>
                  <h4 className="font-extrabold text-[#1F2937] text-sm group-hover:text-[#00A651] transition-colors leading-snug line-clamp-2">
                    {rel.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
