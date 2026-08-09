// Bookings & orders store — backed by the real Postgres `submissions` table
// via /api/submissions, so every customer's booking is visible to the admin
// portal on any device.

export type SubmissionType =
  | "construction"
  | "event"
  | "salon"
  | "travel"
  | "logistics"
  | "tech-repair"
  | "car-rental"
  | "marketplace";

export type SubmissionStatus = "pending" | "reviewed" | "accepted" | "completed" | "rejected";

export type Submission = {
  id: string;
  type: SubmissionType;
  createdAt: string;
  status: SubmissionStatus;
  total?: number;
  currency?: string;
  customer?: { firstName: string; lastName: string; email: string; phone: string; whatsapp?: string };
  summary?: string;
  payload: Record<string, unknown>;
};

export async function getSubmissions(filters?: { type?: SubmissionType; status?: SubmissionStatus }): Promise<Submission[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    const res = await fetch(`/api/submissions${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) return [];
    return data.data as Submission[];
  } catch {
    return [];
  }
}

export async function getSubmissionsByType(type: SubmissionType): Promise<Submission[]> {
  return getSubmissions({ type });
}

export async function addSubmission(
  data: Omit<Submission, "id" | "createdAt" | "status">,
): Promise<Submission | null> {
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.ok) return null;
    const entry = json.data as Submission;
    notifyCustomer(entry);
    return entry;
  } catch {
    return null;
  }
}

function notifyCustomer(entry: Submission): void {
  if (typeof window === "undefined") return;
  const customer = entry.customer;
  if (!customer || (!customer.email && !customer.phone)) return;

  fetch("/api/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      email: customer.email,
      phone: customer.phone,
      summary: entry.summary || entry.type,
      total: entry.total,
      reference: entry.id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      try {
        sessionStorage.setItem("ff_last_notify", JSON.stringify(data));
      } catch {
        /* ignore */
      }
    })
    .catch(() => {});
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<boolean> {
  try {
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

export async function removeSubmission(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}

export async function pendingCount(type?: SubmissionType): Promise<number> {
  const all = await getSubmissions(type ? { type } : undefined);
  return all.filter((s) => s.status === "pending").length;
}
