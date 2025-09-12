"use client";

import Image from "next/image";

export function AppHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-20 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: "var(--color-border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <Image src="/logo.png" alt="Logo" width={36} height={36} priority className="h-9 w-9 rounded-xl object-contain" />
        <div>
          <div className="font-display font-semibold leading-none">Budget Guidelines - Self-Employed Stylist</div>
          <div className="text-xs text-slate-500 leading-none mt-0.5">Powered by Summit</div>
        </div>
      </div>
    </header>
  );
}


