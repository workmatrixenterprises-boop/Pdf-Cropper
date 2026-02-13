import { Tool } from "@/lib/tools";
import ToolLogo from "@/components/ToolLogo";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a
      href={`/${tool.slug}`}
      className="group block rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        <ToolLogo icon={tool.icon} accent={tool.accent} />

        <div className="min-w-0">
          <div className="text-xs text-zinc-500">{tool.title}</div>
          <div className="mt-1 text-xl font-semibold tracking-tight">{tool.heading}</div>
          <div className="mt-2 line-clamp-2 text-sm text-zinc-700">{tool.tagline}</div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2 text-sm text-white shadow-sm transition group-hover:opacity-90">
            {tool.buttonText}
            <span className="opacity-70">→</span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
       
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-1">
          {tool.mode === "preset" ? "One-click crop" : tool.mode === "manual" ? "Manual select" : "Utility"}
        </span>
        <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${tool.accent}`} />
      </div>
    </a>
  );
}
