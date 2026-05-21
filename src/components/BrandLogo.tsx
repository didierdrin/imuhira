import Link from "next/link";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center shrink-0 ${className}`}>
      <span className="flex items-baseline">
        <b className="text-xl sm:text-2xl font-bold text-green-500">i</b>
        <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-900 bg-clip-text text-transparent">
          Muhira
        </span>
      </span>
    </Link>
  );
}
