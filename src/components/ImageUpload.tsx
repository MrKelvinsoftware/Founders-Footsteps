"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, Link2, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { fileToDataUrl } from "@/lib/contentStore";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export default function ImageUpload({ value, onChange, label = "Image", hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">(value.startsWith("http") ? "url" : "upload");
  const [urlDraft, setUrlDraft] = useState(value.startsWith("http") ? value : "");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) { setErr("Please choose an image file."); return; }
    setErr("");
    setBusy(true);
    try {
      const url = await fileToDataUrl(f);
      onChange(url);
      setMode("upload");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Could not process image.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };
  const applyUrl = () => { if (urlDraft.trim()) { onChange(urlDraft.trim()); setErr(""); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">{label}</label>
        <div className="flex items-center gap-1 text-[11px]">
          <button type="button" onClick={() => setMode("upload")} className={`px-2 py-1 rounded ${mode === "upload" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}>Upload</button>
          <button type="button" onClick={() => setMode("url")} className={`px-2 py-1 rounded ${mode === "url" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}>Paste URL</button>
        </div>
      </div>
      {value && (
        <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
          <img src={value} alt="preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => { onChange(""); setUrlDraft(""); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center shadow"><X className="w-4 h-4" /></button>
        </div>
      )}
      {mode === "upload" ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50 hover:border-slate-400"}`}>
          <Upload className={`w-7 h-7 mx-auto mb-2 ${dragging ? "text-orange-500" : "text-slate-400"}`} />
          <p className="text-sm font-medium text-slate-700">{busy ? "Processing…" : "Drop an image or click to browse"}</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="url" value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="https://…" className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-500" />
          </div>
          <button type="button" onClick={applyUrl} className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-orange-500">Apply</button>
        </div>
      )}
      {err && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {err}</p>}
      {hint && !err && <p className="mt-1 text-[11px] text-slate-500 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {hint}</p>}
    </div>
  );
}
