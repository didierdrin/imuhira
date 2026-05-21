import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

interface SiteNavProps {
  active?: "buy" | "rent";
}

export function SiteNav({ active }: SiteNavProps) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:py-0 sm:h-16 min-h-[4rem]">
          <BrandLogo />

          <div className="flex items-center gap-4 sm:gap-8 order-3 w-full justify-center md:order-none md:w-auto">
            <Link
              href="/buy"
              className={
                active === "buy"
                  ? "underline text-emerald-600 font-semibold"
                  : "text-slate-600 hover:text-slate-800 transition"
              }
            >
              Buy
            </Link>
            <Link
              href="/rent"
              className={
                active === "rent"
                  ? "underline text-emerald-600 font-semibold"
                  : "text-slate-600 hover:text-slate-800 transition"
              }
            >
              Rent
            </Link>
          </div>

          <div className="flex gap-1 sm:gap-2 shrink-0">
            <button className="bg-white text-slate-600 px-3 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm rounded-sm border border-slate-400 hover:bg-slate-700 hover:text-white transition font-medium">
              Sign In
            </button>
            <button className="bg-emerald-600 text-white px-3 py-1.5 text-xs sm:px-6 sm:py-2 sm:text-sm rounded-sm hover:bg-emerald-700 transition font-medium">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
