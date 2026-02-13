"use client";

import { useMemo, useState } from "react";
import ToolLogo from "@/components/ToolLogo";
import { TOOLS } from "@/lib/tools";

export default function Header() {
  const [open, setOpen] = useState(false);

  // =========================
  // SECTION: Tool Grouping
  // =========================
  const { labelTools, utilityTools, fnskuTool } = useMemo(() => {
    const labelSlugs = new Set([
      "amazon-label-crop",
      "flipkart-label-crop",
      "meesho-label-crop",
      "shopsy-label-crop",
      "jiomart-label-crop",
      "myntra-label-crop",
      "ajio-label-crop",
      "snapdeal-label-crop",
      "glowroad-label-crop",
    ]);

    const labelTools = TOOLS.filter((t) => labelSlugs.has(t.slug));
    const utilityTools = TOOLS.filter((t) => !labelSlugs.has(t.slug) && t.slug !== "amazon-fnsku-barcode-label-generator");
    const fnskuTool = TOOLS.find((t) => t.slug === "amazon-fnsku-barcode-label-generator");

    return { labelTools, utilityTools, fnskuTool };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* =========================
            SECTION: Website Logo + Brand
           ========================= */}
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="PDF Cropper"
            className="h-10 w-auto"
            onError={(e) => {
              // fallback if logo missing
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          <div className="leading-tight">
            <div className="font-extrabold text-lg tracking-tight">PDF Cropper</div>
            <div className="text-xs text-zinc-500 -mt-0.5">Ecommerce label tools</div>
          </div>
        </a>

        {/* =========================
            SECTION: Desktop Navigation
           ========================= */}
        <nav className="hidden md:flex items-center gap-2">
          <a href="/" className="rounded-xl px-3 py-2 text-sm hover:bg-white/70 transition">
            Home
          </a>

          {/* =========================
              SECTION: Tools Dropdown
             ========================= */}
          <div className="group relative">
            <button className="rounded-xl px-3 py-2 text-sm hover:bg-white/70 transition">
              Tools ▾
            </button>

            <div className="invisible absolute left-0 top-full mt-2 w-[880px] rounded-3xl border border-white/60 bg-white/85 backdrop-blur p-5 shadow-xl opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="grid gap-5 md:grid-cols-3">
                {/* Ecommerce label tools */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Ecommerce Labels
                  </div>
                  <div className="grid gap-1">
                    {labelTools.map((t) => (
                      <a
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white transition"
                      >
                        <div className="scale-[0.85]">
                          <ToolLogo icon={t.icon} accent={t.accent} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{t.heading}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1">{t.tagline}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Utility tools */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Utilities
                  </div>
                  <div className="grid gap-1">
                    {utilityTools.map((t) => (
                      <a
                        key={t.slug}
                        href={`/${t.slug}`}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white transition"
                      >
                        <div className="scale-[0.85]">
                          <ToolLogo icon={t.icon} accent={t.accent} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{t.heading}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1">{t.tagline}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Highlights
                  </div>

                  <div className="grid gap-1">
                    {/* FNSKU */}
                    {fnskuTool && (
                      <a
                        href={`/${fnskuTool.slug}`}
                        className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white transition"
                      >
                        <div className="scale-[0.85]">
                          <ToolLogo icon={fnskuTool.icon} accent={fnskuTool.accent} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{fnskuTool.heading}</div>
                          <div className="text-xs text-zinc-500 line-clamp-1">{fnskuTool.tagline}</div>
                        </div>
                      </a>
                    )}

                    {/* Manual Crop quick link */}
                    <a
                      href="/crop-pdf"
                      className="flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white transition"
                    >
                      <div className="scale-[0.85]">
                        <ToolLogo icon="manualcrop" accent="from-zinc-800 to-zinc-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">Manual Crop (Draw Box)</div>
                        <div className="text-xs text-zinc-500 line-clamp-1">
                          Draw crop area on preview → apply to all pages.
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4 text-xs text-zinc-700">
                    <div className="font-semibold">Tip</div>
                    Use <b>Manual Crop</b> once to find perfect crop area, then reuse on similar labels.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <a href="/crop-pdf" className="rounded-xl px-3 py-2 text-sm hover:bg-white/70 transition">
            Manual Crop
          </a>
          <a href="/pdf-merge" className="rounded-xl px-3 py-2 text-sm hover:bg-white/70 transition">
            Merge
          </a>
          <a href="/rearrange-pdf" className="rounded-xl px-3 py-2 text-sm hover:bg-white/70 transition">
            ReArrange
          </a>
        </nav>

        {/* =========================
            SECTION: Desktop CTA Button
           ========================= */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/amazon-fnsku-barcode-label-generator"
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-sm bg-gradient-to-br from-zinc-900 to-zinc-700 hover:opacity-90 transition"
          >
            FNSKU Generator
          </a>
        </div>

        {/* =========================
            SECTION: Mobile Menu Button
           ========================= */}
        <div className="md:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* =========================
          SECTION: Mobile Menu Panel
         ========================= */}
      {open && (
        <div className="md:hidden border-t bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-4 grid gap-2">
            <a href="/" className="rounded-xl px-3 py-2 hover:bg-white transition">
              Home
            </a>
            <a href="/crop-pdf" className="rounded-xl px-3 py-2 hover:bg-white transition">
              Manual Crop
            </a>
            <a href="/pdf-merge" className="rounded-xl px-3 py-2 hover:bg-white transition">
              Merge
            </a>
            <a href="/rearrange-pdf" className="rounded-xl px-3 py-2 hover:bg-white transition">
              ReArrange
            </a>
            <a
              href="/amazon-fnsku-barcode-label-generator"
              className="rounded-xl px-3 py-2 bg-zinc-900 text-white"
            >
              FNSKU Generator
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
