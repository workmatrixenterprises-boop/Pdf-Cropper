"use client";

import ToolLogo from "@/components/ToolLogo";
import { TOOLS } from "@/lib/tools";

export default function Footer() {
  // =========================
  // SECTION: Popular Tools List
  // =========================
  const popularSlugs = [
    "amazon-label-crop",
    "flipkart-label-crop",
    "meesho-label-crop",
    "amazon-fnsku-barcode-label-generator",
    "pdf-merge",
    "rearrange-pdf",
    "crop-pdf",
  ];

  const popularTools = TOOLS.filter((t) => popularSlugs.includes(t.slug));

  return (
    <footer className="mt-12 border-t border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-3">
        {/* =========================
            SECTION: Brand + Description
           ========================= */}
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="PDF Cropper"
              className="h-10 w-auto"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <div className="text-lg font-extrabold tracking-tight">PDF Cropper</div>
              <div className="text-xs text-zinc-500 -mt-0.5">Ecommerce label tools</div>
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-700 leading-relaxed">
            Crop ecommerce shipping labels, merge PDFs, rearrange pages, and generate FNSKU barcode sheets —
            fast, clean, and simple.
          </p>

          {/* =========================
              SECTION: Privacy Note
             ========================= */}
          <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-zinc-700 shadow-sm">
            <div className="font-semibold">Privacy Note</div>
            Avoid uploading highly sensitive documents. Files are processed instantly.
          </div>

          {/* =========================
              SECTION: Trademark Disclaimer
             ========================= */}
          <div className="mt-4 text-xs text-zinc-500">
            Amazon, Flipkart, Meesho, and other names/logos are trademarks of their respective owners.
          </div>
        </div>

        {/* =========================
            SECTION: Popular Tools
           ========================= */}
        <div>
          <div className="text-sm font-semibold">Popular Tools</div>
          <div className="mt-4 grid gap-3">
            {popularTools.map((t) => (
              <a
                key={t.slug}
                href={`/${t.slug}`}
                className="group flex items-center gap-3 rounded-3xl border border-white/60 bg-white/75 p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="scale-[0.85]">
                  <ToolLogo icon={t.icon} accent={t.accent} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900">{t.heading}</div>
                  <div className="text-xs text-zinc-500 line-clamp-1">{t.tagline}</div>
                </div>
                <div className="ml-auto text-zinc-400 group-hover:text-zinc-700 transition">→</div>
              </a>
            ))}
          </div>
        </div>

        {/* =========================
            SECTION: All Tools
           ========================= */}
        <div>
          <div className="text-sm font-semibold">All Tools</div>
          <div className="mt-4 grid gap-2">
            {TOOLS.map((t) => (
              <a
                key={t.slug}
                href={`/${t.slug}`}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white/70 transition"
              >
                <div className="scale-[0.7]">
                  <ToolLogo icon={t.icon} accent={t.accent} />
                </div>
                <span className="text-sm text-zinc-800">{t.heading}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* =========================
          SECTION: Bottom Bar Links
         ========================= */}
      <div className="border-t border-white/40">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-xs text-zinc-500">
          <div>© {new Date().getFullYear()} PDF Cropper. All rights reserved.</div>

          <div className="flex items-center gap-4">
            <a className="hover:underline" href="/">Home</a>
            <a className="hover:underline" href="/crop-pdf">Manual Crop</a>
            <a className="hover:underline" href="/pdf-merge">Merge</a>
            <a className="hover:underline" href="/rearrange-pdf">ReArrange</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
