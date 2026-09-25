"use client";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Sora, system-ui, sans-serif", background: "#fafaf7", margin: 0 }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 440, background: "#fff", borderRadius: 24, border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(15,23,42,.08)", padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "#d97706", fontWeight: 600, marginBottom: 8 }}>Founders &amp; Footsteps</p>
            <h1 style={{ fontSize: 24, margin: "0 0 8px", color: "#0f172a" }}>We hit a snag</h1>
            <p style={{ color: "#475569", fontSize: 14, marginBottom: 20 }}>The page ran into an unexpected error. Please reload.</p>
            <button onClick={reset} style={{ background: "#0f172a", color: "#fff", border: 0, borderRadius: 999, padding: "12px 22px", fontWeight: 600, cursor: "pointer" }}>Reload page</button>
          </div>
        </div>
      </body>
    </html>
  );
}
