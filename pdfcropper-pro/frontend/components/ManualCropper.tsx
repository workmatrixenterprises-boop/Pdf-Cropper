"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// pdf.js worker for Next.js
// @ts-ignore
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Rect = { x: number; y: number; w: number; h: number };

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManualCropper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rect, setRect] = useState<Rect | null>(null);
  const [dragging, setDragging] = useState(false);
  const startPt = useRef<{ x: number; y: number } | null>(null);

  const scale = 1.5;

  async function renderFirstPage(bytes: Uint8Array) {
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const renderTask = page.render({ canvasContext: ctx, viewport });
    await renderTask.promise;
  }

  useEffect(() => {
    if (!pdfBytes) return;
    setRect(null);
    setError(null);
    renderFirstPage(pdfBytes).catch((e) => setError(String(e?.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfBytes]);

  function onPickFile(f: File) {
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPdfBytes(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(f);
  }

  function getLocalXY(e: React.MouseEvent) {
    const wrap = wrapRef.current!;
    const r = wrap.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!canvasRef.current) return;
    setDragging(true);
    const p = getLocalXY(e);
    startPt.current = p;
    setRect({ x: p.x, y: p.y, w: 0, h: 0 });
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || !startPt.current) return;
    const p = getLocalXY(e);
    const s = startPt.current;
    const x = Math.min(s.x, p.x);
    const y = Math.min(s.y, p.y);
    const w = Math.abs(p.x - s.x);
    const h = Math.abs(p.y - s.y);
    setRect({ x, y, w, h });
  }

  function onMouseUp() {
    setDragging(false);
    startPt.current = null;
  }

  const ratioBox = useMemo(() => {
    if (!rect || !canvasRef.current) return null;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const x0r = clamp(rect.x / cw);
    const y0r = clamp(rect.y / ch);
    const x1r = clamp((rect.x + rect.w) / cw);
    const y1r = clamp((rect.y + rect.h) / ch);

    return { x0r, y0r, x1r, y1r };
  }, [rect]);

  async function processCrop() {
    setError(null);
    if (!file) return setError("Please upload a PDF.");
    if (!ratioBox) return setError("Please draw a crop rectangle on the preview first.");

    if ((ratioBox.x1r - ratioBox.x0r) < 0.02 || (ratioBox.y1r - ratioBox.y0r) < 0.02) {
      return setError("Crop box too small. Please select a larger area.");
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("x0r", String(ratioBox.x0r));
      fd.append("y0r", String(ratioBox.y0r));
      fd.append("x1r", String(ratioBox.x1r));
      fd.append("y1r", String(ratioBox.y1r));
      fd.append("rotate_degrees", "0");

      const res = await fetch(`${API_BASE}/crop/manual`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      downloadBlob(blob, "manual-crop.pdf");
    } catch (e: any) {
      setError(e?.message || "Crop failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-zinc-500">Upload PDF</div>
        <input
          type="file"
          accept="application/pdf"
          className="mt-3 block w-full text-sm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickFile(f);
          }}
        />

        <button
          onClick={processCrop}
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-zinc-900 px-4 py-3 text-white disabled:opacity-60"
        >
          {busy ? "Processing..." : "Crop All Pages & Download"}
        </button>

        <div className="mt-3 text-xs text-zinc-600">
          Draw once on page 1 → same crop is applied to all pages.
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-sm text-zinc-500">Preview (Page 1)</div>

        {!pdfBytes ? (
          <div className="mt-4 rounded-xl border bg-zinc-50 p-6 text-sm text-zinc-700">
            Upload a PDF to preview and draw crop area.
          </div>
        ) : (
          <div
            ref={wrapRef}
            className="mt-4 relative inline-block select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <canvas ref={canvasRef} className="block rounded-xl border" />
            {rect && (
              <div
                className="absolute border-2 border-zinc-900 bg-zinc-900/10"
                style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
