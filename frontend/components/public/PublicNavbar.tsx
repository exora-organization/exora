"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import Image from "next/image";
import Link from "next/link";
import logoImg from "../../public/logo.png";

export function PublicNavbar() {
  const { role, profile, loading, isAuthenticated } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  const handlePortalClick = () => {
    setIsNavigating(true);
    if (isAuthenticated && role) {
      if (role === "admin") router.push("/admin-dashboard");
      else if (role === "company_owner") router.push("/owner-dashboard");
      else if (role === "export_manager") router.push("/export-manager-dashboard");
      else if (role === "finance_staff") router.push("/finance-dashboard");
      else {
        if (profile?.companyId || profile?.companyStatus) {
          router.push("/application-status");
        } else {
          router.push("/company-application");
        }
      }
    } else {
      router.push("/login");
    }
  };

  const navLinks = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT US" },
    { href: "/services", label: "SERVICES" },
    { href: "/projects", label: "PROJECTS" },
    { href: "/blog", label: "BLOG" },
    { href: "/contact", label: "CONTACT US" },
  ];

  return (
    <header className="relative z-10 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <Link href="/" className="font-extrabold text-gray-900 tracking-tight text-xl">EXORA</Link>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`${isActive ? 'text-[#0a9b5c]' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center space-x-4">
        <button 
          onClick={handlePortalClick}
          disabled={isNavigating || loading}
          className="bg-[#0a9b5c] hover:bg-[#08824d] text-white px-6 py-2.5 rounded text-sm font-bold tracking-widest uppercase transition-colors shadow-md disabled:opacity-70 flex items-center space-x-2"
        >
          <span>{isNavigating || loading ? "LOADING..." : "CLIENT PORTAL"}</span>
        </button>
      </div>
    </header>
  );
}
