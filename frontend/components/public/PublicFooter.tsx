import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="w-full px-6 lg:px-20 py-16 pb-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start relative z-10">
      <div className="mb-12 md:mb-0 space-y-4">
        <h4 className="font-extrabold text-black text-lg max-w-sm">
          EXORA - Export Feasibility & Decision Support Platform
        </h4>
        <p className="text-xs text-gray-500 pt-2">
          © 2026 EXORA- All rights reserved.
        </p>
      </div>
      
      <div className="flex flex-col space-y-4 md:mr-12">
        <h5 className="font-bold text-gray-700 text-xs tracking-widest uppercase mb-1">
          PORTAL QUICK LINKS
        </h5>
        <Link href="/about" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
          About Us
        </Link>
        <Link href="/register" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
          Create New Account
        </Link>
        <Link href="/services" className="text-sm text-gray-700 hover:text-[#0a9b5c] transition-colors font-medium">
          Cargo Services
        </Link>
      </div>
    </footer>
  );
}
