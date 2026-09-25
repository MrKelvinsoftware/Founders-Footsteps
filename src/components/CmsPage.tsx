"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";

type CmsSection = {
  heading: string;
  body: string;
};

type CmsData = {
  title: string;
  subtitle?: string;
  heroImage?: string;
  sections: CmsSection[];
};

interface CmsPageProps {
  slug: string;
  fallback: CmsData;
}

export default function CmsPage({ slug, fallback }: CmsPageProps) {
  const [data, setData] = useState<CmsData>(fallback);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cms?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        const json = await res.json();
        if (json.ok && json.data && json.data.content) {
          const content = json.data.content as CmsData;
          if (content.title && content.sections && content.sections.length > 0) {
            setData(content);
          }
        }
      } catch {
        // fallback remains
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const isFaq = slug === "faq";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      {data.heroImage ? (
        <section className="relative h-[360px] flex items-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${data.heroImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/70" />
          </div>
          <div className="relative z-10 container mx-auto px-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">{data.title}</h1>
            {data.subtitle && (
              <p className="text-xl text-white/80 max-w-2xl">{data.subtitle}</p>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-4 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="font-display text-4xl text-slate-900 mb-2">{data.title}</h1>
            {data.subtitle && (
              <p className="text-slate-600 text-lg">{data.subtitle}</p>
            )}
          </div>
        </section>
      )}

      {/* Content */}
      <section className="container mx-auto px-4 py-12 max-w-3xl">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 animate-pulse">Loading content…</p>
          </div>
        ) : isFaq ? (
          /* FAQ accordion layout */
          <div className="space-y-3">
            {data.sections.map((sec, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-slate-900">
                    {sec.heading}
                  </span>
                  {openIdx === i ? (
                    <Minus className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-5 text-slate-600 whitespace-pre-line">
                    {sec.body}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Standard sections layout */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
            {data.sections.map((sec, i) => (
              <div key={i}>
                <h2 className="font-display text-xl text-slate-900 mb-3">
                  {sec.heading}
                </h2>
                <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
