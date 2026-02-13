"use client";

import { useRef, useState } from "react";
import { Tool } from "@/lib/tools";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function getLogoSrc(tool: Tool) {
  // map special icons to file names
  const special: Record<string, string> = {
    manualcrop: "crop.svg",
    fnsku: "barcode.svg",
    merge: "merge.svg",
    rearrange: "rearrange.svg",
  };

  const file = special[tool.icon] || `${tool.icon}.svg`;
  return `/logos/${file}`;
}

export default function UploadAndProcess({ tool }: { tool: Tool }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState("1,3,2");
  const [logoOk, setLogoOk] = useState(true);

  const logoSrc = getLogoSrc(tool);

  async function handlePreset(file: File) {
    if (!tool.preset) throw new Error("Preset missing");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("preset", tool.preset);
    fd.append("rotate_degrees", "0");

    const res = await fetch(`${API_BASE}/crop/preset`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    downloadBlob(blob, `${tool.preset}.pdf`);
  }

  async function handleMerge(files: FileList) {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch(`${API_BASE}/pdf/merge`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    downloadBlob(blob, `merged.pdf`);
  }

  async function handleRearrange(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("order", order);
    const res = await fetch(`${API_BASE}/pdf/rearrange`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    downloadBlob(blob, `rearranged.pdf`);
  }

  async function onFilesSelected(files: FileList | null) {
    setError(null);
    if (!files || files.length === 0) return;

    setBusy(true);
    try {
      if (tool.mode === "preset") {
        await handlePreset(files[0]);
      } else if (tool.mode === "merge") {
        if (files.length < 2) throw new Error("Please select at least 2 PDFs to merge.");
        await handleMerge(files);
      } else if (tool.mode === "rearrange") {
        await handleRearrange(files[0]);
      } else {
        throw new Error("This tool uses a custom UI.");
      }
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-white shadow-sm">
          {logoOk ? (
            <img
              src={logoSrc}
              alt={tool.heading}
              className="h-7 w-auto object-contain"
              onError={() => setLogoOk(false)} // if 404, fallback to letter
            />
          ) : (
            <span className="text-base font-bold text-zinc-800">
              {tool.heading?.[0] ?? "P"}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-xs text-zinc-500">Upload PDF</div>
          <div className="text-base font-semibold text-zinc-900 truncate">{tool.heading}</div>
        </div>
      </div>

      {/* Rearrange options */}
      {tool.mode === "rearrange" && (
        <div className="mb-3 rounded-xl border bg-zinc-50 p-4">
          <div className="text-sm font-medium">Page Order (comma separated)</div>
          <input
            className="mt-2 w-full rounded-xl border bg-white p-3"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="Example: 1,3,2"
          />
          <div className="mt-2 text-xs text-zinc-600">
            Example: "1,3,2" means page1 → page3 → page2.
          </div>
        </div>
      )}

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple={tool.mode === "merge"}
        onChange={(e) => onFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Button with logo */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-white disabled:opacity-60"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          {logoOk ? (
            <img
              src={logoSrc}
              alt=""
              className="h-5 w-auto object-contain"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <span className="text-xs font-bold">{tool.heading?.[0] ?? "P"}</span>
          )}
        </span>
        <span>{busy ? "Processing..." : tool.buttonText}</span>
      </button>

      <div className="mt-2 text-xs text-zinc-600">
        Preset tools run in one click. Manual crop and FNSKU have their own UI.
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
