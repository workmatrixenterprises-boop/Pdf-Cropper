import ToolCard from "@/components/ToolCard";
import { TOOLS } from "@/lib/tools";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold">PDF Cropper Tools</h1>
      <p className="mt-2 text-zinc-700">
        Crop ecommerce labels, merge PDFs, rearrange pages — fast.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </div>
  );
}
