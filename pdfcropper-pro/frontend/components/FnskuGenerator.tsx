"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FnskuGenerator() {
  const [fnsku, setFnsku] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setError(null);
    if (!fnsku.trim()) return setError("FNSKU is required.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("fnsku", fnsku.trim());
      fd.append("price", price.trim());
      fd.append("qty", String(qty));

      const res = await fetch(`${API_BASE}/fnsku/generate`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      downloadBlob(blob, "fnsku-labels-4x6.pdf");
    } catch (e: any) {
      setError(e?.message || "Failed to generate labels.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
      <div className="text-sm text-zinc-500">Create 4x6 FNSKU labels</div>

      <label className="mt-4 block text-sm font-medium">FNSKU</label>
      <input className="mt-2 w-full rounded-xl border p-3" value={fnsku} onChange={(e) => setFnsku(e.target.value)} />

      <label className="mt-4 block text-sm font-medium">Price (optional)</label>
      <input className="mt-2 w-full rounded-xl border p-3" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 299" />

      <label className="mt-4 block text-sm font-medium">Quantity</label>
      <input
        type="number"
        min={1}
        max={500}
        className="mt-2 w-full rounded-xl border p-3"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      <button
        onClick={generate}
        disabled={busy}
        className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-3 text-white disabled:opacity-60"
      >
        {busy ? "Generating..." : "Generate PDF"}
      </button>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
