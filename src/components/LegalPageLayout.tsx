"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface Props {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPageLayout({ title, subtitle, lastUpdated, sections }: Props) {
  const pathname = usePathname();
  const isFr = pathname?.startsWith("/fr");
  const homeLabel = isFr ? "Accueil" : "Home";
  const tocLabel = isFr ? "Table des matieres" : "Table of contents";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 transition">{homeLabel}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-900 font-medium">{title}</span>
      </nav>

      {/* Header */}
      <div className="mb-10 pb-8 border-b border-gray-100">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-3 text-gray-600 text-lg">{subtitle}</p>}
        <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          {isFr ? "Derniere mise a jour :" : "Last updated:"} {lastUpdated}
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-10">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{tocLabel}</div>
            <ul className="space-y-1.5 border-l border-gray-100">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block pl-4 py-1.5 -ml-px border-l border-transparent hover:border-gray-900 text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <article className="prose prose-gray max-w-none">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
              <h2 className="text-xl lg:text-2xl font-bold mb-4 pb-2 border-b border-gray-100">{s.title}</h2>
              <div className="text-gray-700 space-y-3 leading-relaxed text-[15px]">{s.content}</div>
            </section>
          ))}

          <div className="mt-12 p-5 bg-gray-50 border border-gray-100 rounded-2xl">
            <p className="text-sm text-gray-600">
              {isFr
                ? "Des questions ? Contactez-nous via notre "
                : "Have questions? Reach out via our "}
              <Link href="/contact" className="text-gray-900 font-semibold underline">
                {isFr ? "page contact" : "contact page"}
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
