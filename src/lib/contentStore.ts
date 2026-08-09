// No-code content layer. Admin-created items live in localStorage and are merged
// on top of the hardcoded seed data shipped in @/lib/products and per-page seeds,
// so the public site always has content while admins can add / edit / hide items
// without touching code.

export type CmsKind = "products" | "trips" | "destinations" | "deals" | "services" | "cars" | "careers" | "faq" | "press" | "help" | "returns";

const KEY = (k: CmsKind) => `ff_cms_${k}`;
const HIDDEN_KEY = (k: CmsKind) => `ff_cms_hidden_${k}`;

function read<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(k) || "[]") as T[];
  } catch {
    return [];
  }
}
function write<T>(k: string, v: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    throw new Error("Storage full. Try smaller images.");
  }
}

export function uid(prefix = "cms"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function getCustom<T>(kind: CmsKind): T[] {
  return read<T>(KEY(kind));
}
export function setCustom<T>(kind: CmsKind, items: T[]) {
  write(KEY(kind), items);
}
export function addCustom<T extends Record<string, unknown>>(kind: CmsKind, item: T): T {
  const all = getCustom<T>(kind);
  const next = { ...item, id: (item.id as string) || uid(kind.slice(0, 3)), _custom: true } as T;
  all.unshift(next);
  setCustom(kind, all);
  return next;
}
export function updateCustom<T extends { id: string }>(kind: CmsKind, item: T): T {
  const all = getCustom<T>(kind);
  const i = all.findIndex((x) => x.id === item.id);
  if (i >= 0) all[i] = { ...item, _custom: true } as T;
  else all.unshift({ ...item, _custom: true } as T);
  setCustom(kind, all);
  return item;
}
export function removeCustom(kind: CmsKind, id: string) {
  setCustom(kind, getCustom<unknown>(kind).filter((x: any) => x.id !== id));
}

export function getHidden(kind: CmsKind): string[] {
  return read<string>(HIDDEN_KEY(kind));
}
export function hide(kind: CmsKind, id: string) {
  const h = getHidden(kind);
  if (!h.includes(id)) {
    h.push(id);
    write(HIDDEN_KEY(kind), h);
  }
}
export function unhide(kind: CmsKind, id: string) {
  write(
    HIDDEN_KEY(kind),
    getHidden(kind).filter((x) => x !== id),
  );
}

export function mergeWithSeed<T extends { id: string }>(seed: T[], kind: CmsKind): T[] {
  const hidden = new Set(getHidden(kind));
  const custom = getCustom<T>(kind);
  const seedById = new Map(seed.map((s) => [s.id, s]));
  const customById = new Map(custom.map((c) => [c.id, c]));

  const visibleSeeds = seed
    .filter((s) => !hidden.has(s.id))
    .map((s) => (customById.has(s.id) ? ({ ...s, ...customById.get(s.id)! } as T) : s));

  const newCustoms = custom.filter((c) => !seedById.has(c.id));

  return [...newCustoms, ...visibleSeeds];
}

export function fileToDataUrl(file: File, max = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
