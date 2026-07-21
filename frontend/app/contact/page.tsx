"use client";

import { PublicNavbar } from "../../components/public/PublicNavbar";
import { PublicFooter } from "../../components/public/PublicFooter";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Script from "next/script";
import { motion } from "framer-motion";
import { apiClient } from "../../lib/api/client";
import heroBg from "../../public/dashboard-bg.png";

// Standard Google reCAPTCHA v2 testing Site Key (always works on localhost/127.0.0.1)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Controlled form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // reCAPTCHA state
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // Error/validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Expose callback globally so reCAPTCHA can invoke it
    (window as any).onRecaptchaVerify = (token: string) => {
      setRecaptchaToken(token);
    };
    (window as any).onRecaptchaExpired = () => {
      setRecaptchaToken(null);
    };

    return () => {
      delete (window as any).onRecaptchaVerify;
      delete (window as any).onRecaptchaExpired;
    };
  }, []);

  const resetRecaptcha = () => {
    setRecaptchaToken(null);
    if (typeof window !== "undefined" && (window as any).grecaptcha) {
      try {
        (window as any).grecaptcha.reset();
      } catch (e) {
        console.error("Failed to reset grecaptcha", e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setEmailError(null);

    // Validate inputs locally to prevent generic "invalid request" backend errors
    if (fullName.trim().length < 2) {
      setSubmitError("Full Name must be at least 2 characters.");
      return;
    }
    
    // Explicit regex check to enforce top-level domain (e.g. .com)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address with a top-level domain (e.g. .com)");
      return;
    }

    if (subject.trim().length < 3) {
      setSubmitError("Subject must be at least 3 characters.");
      return;
    }

    if (message.trim().length < 10) {
      setSubmitError("Message must be at least 10 characters.");
      return;
    }

    if (!recaptchaToken) {
      setSubmitError("Please complete the Google reCAPTCHA verification.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: fullName,
          email,
          companyName,
          subject,
          message,
          recaptchaToken,
        }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send message. Please try again.");
      resetRecaptcha(); // Reset captcha challenge on submission error
    } finally {
      setIsSubmitting(false);
    }
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
      
      {/* Load Google reCAPTCHA v2 Script */}
      <Script 
        src="https://www.google.com/recaptcha/api.js" 
        strategy="afterInteractive"
      />

      {/* ================= HERO SECTION ================= */}
      <div
        className="relative flex flex-col overflow-hidden h-[50vh] min-h-[400px] justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(12, 30, 28, 0.72), rgba(12, 30, 28, 0.60)), url(${heroBg.src})`
        }}
      >
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
            <div className="bg-white/70 backdrop-blur-md p-8 lg:p-10 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.1)] transition-all duration-300 flex flex-col h-full group">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-[#1F2937] mb-2">Contact Information</h3>
                <p className="text-[#6B7280] text-sm lg:text-base">
                  Reach out to us directly through our official channels or visit our office.
                </p>
              </div>

              <div className="flex flex-col justify-between flex-1 mt-8 lg:mt-12 py-4">
                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                    <Icon icon="solar:letter-bold-duotone" className="w-7 h-7" />
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
                    <Icon icon="solar:clock-circle-bold-duotone" className="w-7 h-7" />
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-1">Business Hours</h4>
                    <p className="text-[#4B5563] text-lg font-medium">Monday – Friday</p>
                    <p className="text-[#6B7280] text-sm">09:00 – 17:00 (GMT+7)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="w-14 h-14 rounded-xl bg-[#EBF8F2] text-[#00A651] flex items-center justify-center shrink-0">
                    <Icon icon="solar:map-point-bold-duotone" className="w-7 h-7" />
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
            <div className="bg-white/70 backdrop-blur-md p-8 lg:p-12 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.1)] transition-all duration-300 relative overflow-hidden h-full group">
              {submitted ? (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-12 h-12 bg-[#EBF8F2] rounded-xl flex items-center justify-center mb-6">
                    <Icon icon="solar:plain-bold-duotone" className="w-6 h-6 text-[#00A651]" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-[#1F2937] mb-2">Message Sent!</h3>
                  <p className="text-[#4B5563] text-lg max-w-sm">
                    Thank you for reaching out. Our team has received your message and will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => {
                      setSubmitted(false);
                      setFullName("");
                      setEmail("");
                      setCompanyName("");
                      setSubject("");
                      setMessage("");
                      setEmailError(null);
                      setSubmitError(null);
                      resetRecaptcha();
                    }}
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
                      minLength={2}
                      value={fullName || ""}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email || ""}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                    {emailError && (
                      <p className="text-xs font-bold text-red-500 mt-1">{emailError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName || ""}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Your Company Ltd"
                      className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4B5563]">Subject</label>
                    <input 
                      type="text" 
                      required
                      minLength={3}
                      value={subject || ""}
                      onChange={(e) => setSubject(e.target.value)}
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
                    minLength={10}
                    value={message || ""}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    className="w-full px-4 py-3 rounded-xl border border-[#D1EDE4] focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] transition-all bg-[#EBF8F2]/30 resize-none"
                  ></textarea>
                </div>

                {/* Google reCAPTCHA v2 Widget Container */}
                <div className="flex justify-center my-4">
                  <div 
                    className="g-recaptcha" 
                    data-sitekey={RECAPTCHA_SITE_KEY}
                    data-callback="onRecaptchaVerify"
                    data-expired-callback="onRecaptchaExpired"
                  ></div>
                </div>

                {submitError && (
                  <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold">
                    {submitError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting || !recaptchaToken}
                  className="w-full bg-[#00A651] hover:bg-[#008F44] text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  {!isSubmitting && <Icon icon="solar:plain-bold-duotone" className="w-5 h-5 ml-2" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="pt-8 pb-24 px-6 lg:px-20 max-w-none mx-auto w-full">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00A651] text-white mb-6">
              <Icon icon="solar:question-circle-bold-duotone" className="w-6 h-6" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937]">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white/70 backdrop-blur-md p-7 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.1)] hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
              >
                <h3 className="text-lg font-bold text-[#1F2937] mb-3 group-hover:text-[#00A651] transition-colors">{faq.q}</h3>
                <p className="text-[#4B5563] leading-relaxed flex-1">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
