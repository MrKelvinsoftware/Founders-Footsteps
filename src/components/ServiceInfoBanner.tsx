"use client";

import { useEffect, useState } from "react";

type CmsSection = { heading: string; body: string };
type CmsData = { title: string; subtitle?: string; heroImage?: string; sections: CmsSection[] };

/**
 * Shows admin-managed informational sections for a service page.
 * Reads from /api/cms?slug={slug}-info. If admin has published content,
 * it renders the sections. Otherwise renders nothing (the original
 * hardcoded page content shows through).
 */
export default function ServiceInfoBanner({ slug }: { slug: string }) {
  const [data, setData] = useState<CmsData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/cms?slug=${encodeURIComponent(slug)}-info`, { cache: "no-store" });
        const json = await res.json();
        if (json.ok && json.data && json.data.content) {
          const content = json.data.content as CmsData;
          if (content.sections && content.sections.length > 0) {
            setData(content);
          }
        }
      } catch {
        // no CMS content — render nothing
      }
    })();
  }, [slug]);

  if (!data) return null;

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {data.sections.map((sec, i) => (
            <div key={i}>
              <h3 className="font-display text-xl text-slate-900 mb-2">{sec.heading}</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{sec.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
