"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Mail, Clock, MapPin, Send, MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import heroBg from "../../public/export_map_hero.png";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
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
            Get in Touch
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-[#1F2937] leading-[1.1] tracking-tight mb-8">
            Contact Our Team
          </h1>
          
          <p className="text-[#4B5563] text-lg lg:text-xl leading-relaxed font-medium max-w-2xl mx-auto">
            Have questions about EXORA or need assistance? We'd love to hear from you.
          </p>
        </main>
      </div>

      {/* ================= CONTACT LAYOUT ================= */}
      <section className="py-12 px-6 lg:px-20 max-w-7xl mx-auto w-full mb-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column - Contact Info */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] border border-[#E8E3D9] shadow-sm space-y-8">
              <h3 className="text-2xl font-bold text-[#1F2937] mb-2">Contact Information</h3>
              <p className="text-[#9CA3AF] text-sm mb-8">
                Reach out to us directly through our official channels or visit our office.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F3] text-[#2F6B4F] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">Email</h4>
                    <a href="mailto:support@exora.com" className="text-[#4B5563] hover:text-[#2F6B4F] transition-colors font-medium">
                      support@exora.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F3] text-[#2F6B4F] flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">Business Hours</h4>
                    <p className="text-[#4B5563] font-medium">Monday – Friday</p>
                    <p className="text-[#9CA3AF] text-sm">09:00 – 17:00 (GMT+7)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF8F3] text-[#2F6B4F] flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider mb-1">Location</h4>
                    <p className="text-[#4B5563] font-medium">President University</p>
                    <p className="text-[#9CA3AF] text-sm leading-relaxed">
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
            <div className="bg-white p-8 lg:p-12 rounded-[2rem] border border-[#E8E3D9] shadow-sm relative overflow-hidden">
              {submitted ? (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-[#FAF8F3] rounded-full flex items-center justify-center mb-6">
                    <Send className="w-10 h-10 text-[#2F6B4F]" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-[#1F2937] mb-2">Message Sent!</h3>
                  <p className="text-[#4B5563] text-lg max-w-sm">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 text-[#2F6B4F] font-bold hover:underline"
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
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E3D9] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F] transition-all bg-[#FAF8F3]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E3D9] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F] transition-all bg-[#FAF8F3]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Company Name</label>
                    <input 
                      type="text" 
                      placeholder="Your Company Ltd"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E3D9] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F] transition-all bg-[#FAF8F3]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E3D9] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F] transition-all bg-[#FAF8F3]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#4B5563]">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E3D9] focus:outline-none focus:ring-2 focus:ring-[#2F6B4F]/20 focus:border-[#2F6B4F] transition-all bg-[#FAF8F3]/50 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2F6B4F] hover:bg-[#25563F] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center space-x-2"
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
      <section className="py-20 px-6 lg:px-20 max-w-none mx-auto w-full mb-12 bg-[#F5F8F6] border-t border-[#E8E3D9]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#2F6B4F] text-white mb-6">
              <MessageCircleQuestion className="w-8 h-8" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-[#E8E3D9] hover:border-[#2F6B4F] shadow-sm transition-all duration-300 group">
                <h3 className="text-lg font-bold text-[#1F2937] mb-2 group-hover:text-[#2F6B4F] transition-colors">{faq.q}</h3>
                <p className="text-[#4B5563] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
