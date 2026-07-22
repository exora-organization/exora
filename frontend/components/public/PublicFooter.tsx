import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/logo.png";

export function PublicFooter() {
  return (
    <footer className="w-full bg-gradient-to-b from-white to-[#EBF8F2] border-t border-[#E8E3D9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Logo & Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <Link href="/" className="font-extrabold text-[#1F2937] tracking-tight text-xl">EXORA</Link>
            </div>
            <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-xs">
              A comprehensive export decision support platform helping businesses evaluate and plan their international trade with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#1F2937] mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">Home</Link></li>
              <li><Link href="/about" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link href="/services" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">Services</Link></li>
              <li><Link href="/blog" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">Blog</Link></li>
              <li><Link href="/contact" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">Contact Us</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-bold text-[#1F2937] mb-6">Features</h4>
            <ul className="space-y-4">
              <li className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Export Costing</li>
              <li className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Pricing Engine</li>
              <li className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Financial Analysis</li>
              <li className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Risk Assessment</li>
              <li className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">AI Advisor</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-[#1F2937] mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium">About EXORA</Link></li>
              <li><Link href="/privacy-policy" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-[#9CA3AF] hover:text-[#2F6B4F] transition-colors text-sm font-medium cursor-pointer">Terms of Service</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#E8E3D9] flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-[#9CA3AF] font-medium">
            © 2026 EXORA. All rights reserved.
          </p>
          <p className="text-sm text-[#9CA3AF] font-medium mt-4 md:mt-0">
            Version 1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
