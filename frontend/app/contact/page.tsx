"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Mail, Clock, MapPin, Send, MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import heroBg from "../../public/dashboard-bg.png";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const faqs = [
    {
      q: "Who can use EXORA?",
      a: "Companies planning or evaluating export opportunities."
    },
    {
      q: "Does EXORA execute export transactions?",
      a: "No. EXORA focuses on export analysis and decision support before execution."
    },
    {
      q: "Can multiple users collaborate?",
      a: "Yes. Company Owners can invite Export Managers and Finance Staff to collaborate securely within the same company."
    }
  ];

  return (
    <div className="flex flex-col font-sans bg-[#EBF8F2] min-h-screen selection:bg-[#00A651]/20">
      <PublicNavbar />

      {/* ================= HERO SECTION ================= */}
      <div className="relative flex flex-col overflow-hidden h-[50vh] min-h-[400px] justify-center">
        <Image
          src={heroBg}
          alt="Contact Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0" />

        <main className="relative z-10 flex flex-col items-center justify-center px-6 lg:px-20 max-w-4xl mx-auto w-full text-center">
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow">
            Contact Our Team
          </h1>
        </main>
      </div>

      {/* ================= CONTACT LAYOUT ================= */}
      <section className="py-16 px-6 lg:px-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
          
          {/* Left Column - Contact Info */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white p-8 lg:p-10 rounded-2xl border border-[#D1EDE4] shadow-sm flex flex-col h-full">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#1F2937] mb-2">Contact Information</h3>
                <p className="text-[#6B7280] text-sm lg:text-base">
                  Reach out to us directly through our official channels or visit our office.
                </p>
              </div>

              <div className="flex flex-col justify-between flex-1 mt-8 lg:mt-12 py-4">
                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1">Email</h4>
                    <a href="mailto:support@exora.com" className="text-[#4B5563] text-lg hover:text-[#00A651] transition-colors font-medium">
                      support@exora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1">Business Hours</h4>
                    <p className="text-[#4B5563] text-lg font-medium">Monday – Friday</p>
                    <p className="text-[#6B7280] text-sm">09:00 – 17:00 (GMT+7)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1">Location</h4>
                    <p className="text-[#4B5563] text-lg font-medium">President University</p>
                    <p className="text-[#6B7280] leading-relaxed">
                      Jababeka Education Park<br />
                      Cikarang, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 lg:p-12 rounded-2xl border border-[#D1EDE4] shadow-sm relative overflow-hidden h-full">
              {submitted ? (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 bg-[#EBF8F2] rounded-xl flex items-center justify-center mb-6">
                    <Send className="w-6 h-6 text-[#00A651]" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-[#1F2937] mb-2">Message Sent!</h3>
                  <p className="text-[#4B5563] text-lg max-w-sm">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-[#00A651] font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : null}

              <h3 className="text-2xl font-bold text-[#1F2937] mb-8">Send us a message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Company Ltd"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4B5563]">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center space-x-2"
                >
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  {!isSubmitting && <Send className="w-5 h-5 ml-2" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="pt-8 pb-24 px-6 lg:px-20 max-w-none mx-auto w-full">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00A651] text-white mb-6">
              <MessageCircleQuestion className="w-6 h-6" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937]">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-5">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white p-7 rounded-2xl border border-[#D1EDE4] hover:border-[#00A651] shadow-sm transition-all duration-300 group"
              >
                <h3 className="text-lg font-bold text-[#1F2937] mb-2 group-hover:text-[#00A651] transition-colors">{faq.q}</h3>
                <p className="text-[#4B5563] leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
