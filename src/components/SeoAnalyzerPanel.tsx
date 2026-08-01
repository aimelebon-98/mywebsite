"use client";

import { useMemo, useState } from "react";
import { analyzeSeo, type CheckStatus, type SeoCheck } from "@/lib/seo-analyzer";
import { CheckCircle2, AlertCircle, XCircle, Circle, ChevronDown, ChevronUp, Search } from "lucide-react";

interface Props {
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  focusKeyphrase?: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  coverImageAlt?: string;
  tags?: string[];
  label?: string;
}

function statusColor(status: CheckStatus) {
  switch (status) {
    case "good":  return { text: "text-emerald-700", bg: "bg-emerald-500", ring: "ring-emerald-100", light: "bg-emerald-50" };
    case "ok":    return { text: "text-amber-700",   bg: "bg-amber-500",   ring: "ring-amber-100",   light: "bg-amber-50"   };
    case "bad":   return { text: "text-red-700",     bg: "bg-red-500",     ring: "ring-red-100",     light: "bg-red-50"     };
    case "empty": return { text: "text-gray-500",    bg: "bg-gray-300",    ring: "ring-gray-100",    light: "bg-gray-50"    };
  }
}

function StatusIcon({ status }: { status: CheckStatus }) {
  const c = statusColor(status);
  const iconClass = "w-4 h-4 " + c.text;
  switch (status) {
    case "good":  return <CheckCircle2 className={iconClass} />;
    case "ok":    return <AlertCircle className={iconClass} />;
    case "bad":   return <XCircle className={iconClass} />;
    case "empty": return <Circle className={iconClass} />;
  }
}

function CheckGroup({ title, checks, defaultOpen }: { title: string; checks: SeoCheck[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 hover:text-gray-700"
      >
        <span>{title} ({checks.length})</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <ul className="space-y-1.5">
          {checks.map(check => (
            <li key={check.id} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mt-0.5">
                <StatusIcon status={check.status} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-900">{check.label}</div>
                <div className="text-xs text-gray-600">{check.message}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SeoAnalyzerPanel(props: Props) {
  const { label = "EN" } = props;
  const [expanded, setExpanded] = useState(true);

  const analysis = useMemo(() => analyzeSeo({
    title: props.title,
    seoTitle: props.seoTitle,
    metaDescription: props.metaDescription,
    focusKeyphrase: props.focusKeyphrase,
    slug: props.slug,
    content: props.content,
    excerpt: props.excerpt,
    coverImage: props.coverImage,
    coverImageAlt: props.coverImageAlt,
    tags: props.tags,
  }), [props.title, props.seoTitle, props.metaDescription, props.focusKeyphrase, props.slug, props.content, props.excerpt, props.coverImage, props.coverImageAlt, props.tags]);

  const overall = statusColor(analysis.status);

  const badChecks = analysis.checks.filter(c => c.status === "bad");
  const okChecks = analysis.checks.filter(c => c.status === "ok");
  const goodChecks = analysis.checks.filter(c => c.status === "good");
  const emptyChecks = analysis.checks.filter(c => c.status === "empty");

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className={`w-10 h-10 rounded-full ${overall.light} ${overall.ring} ring-4 flex items-center justify-center flex-shrink-0`}>
          <Search className={`w-5 h-5 ${overall.text}`} />
        </div>

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">SEO Analysis</span>
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs mt-0.5">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${overall.bg}`}></span>
              <span className={`font-bold ${overall.text}`}>{analysis.score}/100</span>
            </div>
            <span className="text-gray-400">-</span>
            <span className="text-gray-600">
              {analysis.goodCount} good, {analysis.okCount} could improve, {analysis.badCount} problems
            </span>
          </div>
        </div>

        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <div className="h-1 bg-gray-100">
        <div
          className={`h-full transition-all duration-500 ${overall.bg}`}
          style={{ width: `${analysis.score}%` }}
        />
      </div>

      {expanded && (
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {badChecks.length > 0 && (
            <CheckGroup title="Problems to fix" checks={badChecks} defaultOpen={true} />
          )}
          {okChecks.length > 0 && (
            <CheckGroup title="Could be improved" checks={okChecks} defaultOpen={badChecks.length === 0} />
          )}
          {goodChecks.length > 0 && (
            <CheckGroup title="Good results" checks={goodChecks} defaultOpen={false} />
          )}
          {emptyChecks.length > 0 && (
            <CheckGroup title="Waiting for data" checks={emptyChecks} defaultOpen={false} />
          )}
        </div>
      )}
    </div>
  );
}
