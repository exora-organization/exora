"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserProfile } from "../../hooks/useUserProfile";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import logoImg from "../../public/logo.png";

export function PublicNavbar() {
  const { role, profile, loading, isAuthenticated } = useUserProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handlePortalClick = () => {
    setIsNavigating(true);
    if (isAuthenticated && role) {
      if (role === "admin") router.push("/admin-dashboard");
      else if (role === "company_owner") router.push("/own-dashboard");
      else if (role === "export_manager") router.push("/em-dashboard");
      else if (role === "finance_staff") router.push("/fs-dashboard");
      else {
        if (profile?.companyId || profile?.companyStatus) {
          router.push("/guest-application-status");
        } else {
          router.push("/guest-company-application");
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
    { href: "/blog", label: "BLOG" },
    { href: "/contact", label: "CONTACT US" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-6 lg:px-12 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-[#E8E3D9] shadow-sm relative">
      <div className="flex items-center space-x-2">
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <Image src={logoImg} alt="EXORA Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <Link href="/" className="font-extrabold text-[#1F2937] tracking-tight text-xl">EXORA</Link>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${isActive ? 'text-[#00A651]' : 'text-[#4B5563] hover:text-[#1F2937]'} transition-colors`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden md:flex items-center space-x-4">
        <button
          onClick={handlePortalClick}
          disabled={isNavigating || loading}
          className="bg-[#00A651] hover:bg-[#008F44] text-white px-6 py-2.5 rounded text-sm font-bold tracking-widest uppercase transition-colors shadow-md disabled:opacity-70 flex items-center space-x-2"
        >
          <span>{isNavigating || loading ? "LOADING..." : "CLIENT PORTAL"}</span>
        </button>
      </div>

      <button 
        className="md:hidden p-2 text-[#1F2937] focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Icon icon={isMobileMenuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-linear"} className="w-8 h-8" />
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-[#E8E3D9] shadow-xl flex flex-col md:hidden py-6 px-6 gap-6 z-50">
          <nav className="flex flex-col space-y-4 text-sm font-bold tracking-wider text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${isActive ? 'text-[#00A651]' : 'text-[#4B5563]'} hover:text-[#1F2937] transition-colors py-2 border-b border-gray-100 last:border-0`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handlePortalClick}
            disabled={isNavigating || loading}
            className="w-full bg-[#00A651] hover:bg-[#008F44] text-white px-6 py-3.5 rounded text-sm font-bold tracking-widest uppercase transition-colors shadow-md disabled:opacity-70 flex justify-center items-center mt-2"
          >
            <span>{isNavigating || loading ? "LOADING..." : "CLIENT PORTAL"}</span>
          </button>
        </div>
      )}
    </header>
  );
}
