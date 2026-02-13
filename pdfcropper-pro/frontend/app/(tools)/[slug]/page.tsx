import UploadAndProcess from "@/components/UploadAndProcess";
import ManualCropper from "@/components/ManualCropper";
import FnskuGenerator from "@/components/FnskuGenerator";
import { TOOLS } from "@/lib/tools";
import type { Metadata } from "next";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = TOOLS.find((t) => t.slug === params.slug);
  if (!tool) return { title: "PDF Cropper", description: "PDF tools" };

  return {
    title: tool.title,
    description: tool.tagline,
    openGraph: { title: tool.title, description: tool.tagline }
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = TOOLS.find((t) => t.slug === params.slug);
  if (!tool) return <div>Tool not found</div>;

  // Custom UI: FNSKU generator
  if (tool.mode === "custom" && tool.slug === "amazon-fnsku-barcode-label-generator") {
    return (
      <div>
        <div className="text-sm text-zinc-500">{tool.title}</div>
        <h1 className="mt-2 text-3xl font-bold">{tool.heading}</h1>
        <p className="mt-3 text-zinc-700">{tool.tagline}</p>
        <div className="mt-6">
          <FnskuGenerator />
        </div>
      </div>
    );
  }

  // Manual crop page with preview & selection
  if (tool.mode === "manual") {
    return (
      <div>
        <div className="text-sm text-zinc-500">{tool.title}</div>
        <h1 className="mt-2 text-3xl font-bold">{tool.heading}</h1>
        <p className="mt-3 text-zinc-700">{tool.tagline}</p>
        <div className="mt-6">
          <ManualCropper />
        </div>
      </div>
    );
  }

  // Default tool page (preset/merge/rearrange)
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="text-sm text-zinc-500">{tool.title}</div>
        <h1 className="mt-2 text-3xl font-bold">{tool.heading}</h1>
        <p className="mt-3 text-zinc-700">{tool.tagline}</p>

        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-zinc-700">
          <div className="font-semibold">How it works</div>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Upload your PDF.</li>
            <li>Click the tool button to process.</li>
            <li>Download the final PDF instantly.</li>
          </ul>
        </div>
      </div>

      <UploadAndProcess tool={tool} />
    </div>
  );
}
