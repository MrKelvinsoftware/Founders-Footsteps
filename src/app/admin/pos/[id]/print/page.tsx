import { db } from "@/db";
import { receipts, cmsContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type BrandingData = {
  logo?: string;
  brandName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

async function getBranding(): Promise<BrandingData> {
  try {
    const [row] = await db.select().from(cmsContent).where(eq(cmsContent.slug, "site-branding")).limit(1);
    if (row?.content) return row.content as BrandingData;
  } catch {}
  return { brandName: "Founders & Footsteps", phone: "0243536679", email: "phrimpongkelvin@gmail.com", address: "Accra, Greater Accra Region, Ghana" };
}

export default async function PrintReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id)).limit(1);
  if (!receipt) notFound();
  
  const branding = await getBranding();
  
  const subtotal = parseFloat(receipt.subtotal || "0");
  const laborCost = parseFloat(receipt.laborCost || "0");
  const tax = parseFloat(receipt.tax || "0");
  const discount = parseFloat(receipt.discount || "0");
  const total = parseFloat(receipt.total);
  
  // Render different styles based on receipt type
  if (receipt.type === "trip_ticket") {
    return <BoardingPassReceipt receipt={receipt} branding={branding} />;
  }
  
  if (receipt.type === "construction_estimate") {
    return <ConstructionEstimate receipt={receipt} branding={branding} subtotal={subtotal} laborCost={laborCost} tax={tax} discount={discount} total={total} />;
  }
  
  // Default receipt style for events and services
  return <StandardReceipt receipt={receipt} branding={branding} subtotal={subtotal} laborCost={laborCost} tax={tax} discount={discount} total={total} />;
}

function ConstructionEstimate({ receipt, branding, subtotal, laborCost, tax, discount, total }: {
  receipt: typeof receipts.$inferSelect;
  branding: BrandingData;
  subtotal: number;
  laborCost: number;
  tax: number;
  discount: number;
  total: number;
}) {
  const items = (receipt.items || []) as Array<{ description: string; quantity: number; unitPrice: number; amount: number; section?: string }>;
  
  return (
    <html>
      <head>
        <title>{receipt.receiptNumber} - Construction Estimate</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px; color: #1e293b; font-size: 11px; line-height: 1.5; }
          @media print {
            body { background: white; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 15mm; }
          }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #475569 0%, #1e293b 100%); color: white; padding: 30px; }
          .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
          .header p { opacity: 0.8; font-size: 12px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; }
          .contact-info { font-size: 10px; opacity: 0.9; }
          .estimate-box { background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; text-align: right; }
          .estimate-box p { font-size: 10px; opacity: 0.8; }
          .estimate-box .ref { font-size: 16px; font-weight: 700; font-family: monospace; }
          .client-section { background: #f1f5f9; padding: 20px 30px; border-bottom: 1px solid #e2e8f0; }
          .client-section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 10px; }
          .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .client-info p { font-size: 12px; color: #334155; }
          .client-info strong { color: #0f172a; }
          .project-section { padding: 20px 30px; border-bottom: 1px solid #e2e8f0; }
          .project-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .project-item label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block; margin-bottom: 4px; }
          .project-item p { font-size: 12px; font-weight: 600; color: #1e293b; }
          .items-section { padding: 20px 30px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; padding: 10px 0; border-bottom: 2px solid #475569; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
          .section-title::before { content: ''; width: 4px; height: 16px; background: #475569; border-radius: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; padding: 8px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
          td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
          td:nth-child(3), td:nth-child(4), td:nth-child(5) { text-align: right; }
          .subtotal-row { background: #f8fafc; font-weight: 600; }
          .totals-section { background: #f8fafc; padding: 20px 30px; }
          .totals-grid { display: flex; justify-content: flex-end; }
          .totals-box { width: 280px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 12px; }
          .totals-row.grand { border-top: 2px solid #475569; margin-top: 10px; padding-top: 15px; font-size: 16px; font-weight: 700; }
          .totals-row.grand .amount { color: #059669; }
          .terms-section { padding: 20px 30px; border-top: 1px solid #e2e8f0; }
          .terms-section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 10px; }
          .terms-section ul { list-style: none; }
          .terms-section li { padding: 6px 0; padding-left: 15px; position: relative; font-size: 10px; color: #475569; }
          .terms-section li::before { content: '•'; position: absolute; left: 0; color: #475569; }
          .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding: 30px; border-top: 1px solid #e2e8f0; }
          .signature-box h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 5px; }
          .signature-box p { font-size: 12px; font-weight: 600; color: #1e293b; }
          .signature-line { border-bottom: 1px solid #cbd5e1; margin-top: 40px; padding-bottom: 5px; }
          .signature-box small { font-size: 9px; color: #94a3b8; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: #1e293b; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>{branding.brandName || "FOUNDERS & FOOTSTEPS"}</h1>
            <p>JUSFO CONSTRUCTION — GENERAL CONSTRUCTION & PROPERTY MAINTENANCE SERVICES</p>
            <div className="header-row">
              <div className="contact-info">
                <p>Phone: {branding.phone || "0243536679"}</p>
                <p>Email: {branding.email || "phrimpongkelvin@gmail.com"}</p>
                <p>{branding.address || "Accra, Greater Accra Region, Ghana"}</p>
              </div>
              <div className="estimate-box">
                <p>Estimate Ref:</p>
                <div className="ref">{receipt.receiptNumber}</div>
                <p style={{ marginTop: 8 }}>Date: {new Date(receipt.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                {receipt.validUntil && <p>Validity: 14 Days</p>}
              </div>
            </div>
          </div>

          <div className="client-section">
            <h3>Client Information</h3>
            <div className="client-grid">
              <div className="client-info">
                <p><strong>{receipt.customerName || "[Client Name / Company]"}</strong></p>
                <p>Contact: {receipt.customerPhone || receipt.customerEmail || "[Client Phone / Email]"}</p>
              </div>
              <div className="client-info">
                <p>Address: {receipt.customerAddress || "[Client Site Address]"}</p>
              </div>
            </div>
          </div>

          <div className="project-section">
            <div className="project-grid">
              <div className="project-item">
                <label>Project</label>
                <p>{receipt.title || "Construction Project"}</p>
              </div>
              <div className="project-item">
                <label>Location</label>
                <p>{receipt.customerAddress || "Project Site, Accra"}</p>
              </div>
              <div className="project-item">
                <label>Scope</label>
                <p>{receipt.description || "As described below"}</p>
              </div>
            </div>
          </div>

          <div className="items-section">
            <div className="section-title">Materials & Services</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 30 }}>#</th>
                  <th>Item Description</th>
                  <th style={{ width: 70 }}>Quantity</th>
                  <th style={{ width: 100 }}>Unit Price ({receipt.currency})</th>
                  <th style={{ width: 100 }}>Amount ({receipt.currency})</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td colSpan={4} style={{ textAlign: "right" }}>Materials Subtotal:</td>
                  <td>{receipt.currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="totals-section">
            <div className="totals-grid">
              <div className="totals-box">
                <div className="totals-row">
                  <span>Materials Subtotal</span>
                  <span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="totals-row">
                  <span>Workman / Labor Fee</span>
                  <span>{laborCost > 0 ? laborCost.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "____________"}</span>
                </div>
                {tax > 0 && (
                  <div className="totals-row">
                    <span>Tax</span>
                    <span>{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="totals-row">
                    <span>Discount</span>
                    <span>-{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="totals-row grand">
                  <span>ESTIMATED GRAND TOTAL</span>
                  <span className="amount">{receipt.currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="terms-section">
            <h3>Terms & Project Notes</h3>
            <ul>
              {(receipt.terms || "").split("\n").filter(Boolean).map((term, idx) => (
                <li key={idx}>{term.replace(/^[•\-]\s*/, "")}</li>
              ))}
            </ul>
          </div>

          <div className="signature-section">
            <div className="signature-box">
              <h4>Prepared By (Contractor)</h4>
              <p>Frimpong Kelvin Ofosu</p>
              <p style={{ fontWeight: 400, fontSize: 10, marginTop: 4 }}>{branding.brandName} / Jusfo Construction</p>
            </div>
            <div className="signature-box">
              <h4>Client Acceptance</h4>
              <div className="signature-line"></div>
              <small>Client Signature & Date — Approved to Proceed</small>
            </div>
          </div>
        </div>
        
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn')?.addEventListener('click', function() { window.print(); });
        `}} />
        <button className="print-btn no-print">🖨️ Print Estimate</button>
      </body>
    </html>
  );
}

function BoardingPassReceipt({ receipt, branding }: {
  receipt: typeof receipts.$inferSelect;
  branding: BrandingData;
}) {
  const trip = (receipt.tripDetails || {}) as {
    origin?: string;
    destination?: string;
    departureDate?: string;
    departureTime?: string;
    passengers?: number;
    seatClass?: string;
    vehicleType?: string;
  };
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };
  
  return (
    <html>
      <head>
        <title>{receipt.receiptNumber} - Boarding Pass</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #0891b2 0%, #164e63 100%); min-height: 100vh; padding: 40px 20px; display: flex; align-items: center; justify-content: center; }
          @media print {
            body { background: white; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 10mm; }
          }
          .boarding-pass { background: white; border-radius: 16px; overflow: hidden; max-width: 700px; width: 100%; box-shadow: 0 25px 50px rgba(0,0,0,0.25); position: relative; }
          .pass-header { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
          .pass-header h1 { font-size: 20px; font-weight: 700; }
          .pass-header p { font-size: 10px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.1em; }
          .pass-header .logo { text-align: right; }
          .pass-header .ref { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 6px; margin-top: 5px; }
          .route-section { padding: 30px; background: linear-gradient(180deg, #ecfeff 0%, white 100%); position: relative; }
          .route-display { display: flex; align-items: center; justify-content: space-between; }
          .city { text-align: center; }
          .city-code { font-size: 48px; font-weight: 900; color: #0e7490; line-height: 1; }
          .city-name { font-size: 14px; color: #64748b; margin-top: 5px; }
          .route-line { flex: 1; margin: 0 30px; position: relative; }
          .route-line::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: repeating-linear-gradient(90deg, #0891b2 0, #0891b2 10px, transparent 10px, transparent 20px); }
          .plane-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 10px; border-radius: 50%; }
          .plane-icon svg { width: 24px; height: 24px; color: #0891b2; transform: rotate(90deg); }
          .details-section { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px dashed #cbd5e1; }
          .detail-box { padding: 20px; text-align: center; border-right: 1px dashed #cbd5e1; }
          .detail-box:last-child { border-right: none; }
          .detail-box label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; display: block; margin-bottom: 5px; }
          .detail-box p { font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
          .detail-box small { font-size: 11px; color: #64748b; }
          .passenger-section { padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .passenger-info h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 5px; }
          .passenger-info p { font-size: 18px; font-weight: 700; color: #0f172a; }
          .qr-placeholder { width: 80px; height: 80px; background: #0e7490; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; text-align: center; }
          .tear-line { position: absolute; right: 120px; top: 0; bottom: 0; border-left: 2px dashed #cbd5e1; }
          .stub { position: absolute; right: 0; top: 0; bottom: 0; width: 120px; background: #f1f5f9; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; }
          .stub-content { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); text-align: center; }
          .stub h4 { font-size: 14px; font-weight: 700; color: #0e7490; margin-bottom: 10px; }
          .stub p { font-size: 10px; color: #64748b; }
          .footer { padding: 15px 30px; background: #0e7490; color: white; font-size: 10px; display: flex; justify-content: space-between; }
          .footer a { color: white; text-decoration: none; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: white; color: #0e7490; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        `}</style>
      </head>
      <body>
        <div className="boarding-pass">
          <div className="pass-header">
            <div>
              <h1>{branding.brandName || "FOUNDERS & FOOTSTEPS"}</h1>
              <p>Travel & Trips Division</p>
            </div>
            <div className="logo">
              <p>Boarding Pass</p>
              <div className="ref">{receipt.receiptNumber}</div>
            </div>
          </div>
          
          <div className="route-section">
            <div className="route-display">
              <div className="city">
                <div className="city-code">{(trip.origin || "ACC").substring(0, 3).toUpperCase()}</div>
                <div className="city-name">{trip.origin || "Accra"}</div>
              </div>
              <div className="route-line">
                <div className="plane-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                </div>
              </div>
              <div className="city">
                <div className="city-code">{(trip.destination || "KUM").substring(0, 3).toUpperCase()}</div>
                <div className="city-name">{trip.destination || "Kumasi"}</div>
              </div>
            </div>
          </div>
          
          <div className="details-section">
            <div className="detail-box">
              <label>Date</label>
              <p>{trip.departureDate ? new Date(trip.departureDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"}</p>
              <small>{trip.departureDate ? new Date(trip.departureDate).getFullYear() : ""}</small>
            </div>
            <div className="detail-box">
              <label>Time</label>
              <p>{trip.departureTime || "—"}</p>
              <small>Departure</small>
            </div>
            <div className="detail-box">
              <label>Passengers</label>
              <p>{trip.passengers || 1}</p>
              <small>Person(s)</small>
            </div>
            <div className="detail-box">
              <label>Class</label>
              <p>{trip.seatClass || "STD"}</p>
              <small>{trip.vehicleType || "Bus"}</small>
            </div>
          </div>
          
          <div className="passenger-section">
            <div className="passenger-info">
              <h3>Passenger Name</h3>
              <p>{receipt.customerName || "PASSENGER"}</p>
            </div>
            <div className="qr-placeholder">
              <span>SCAN<br />TO<br />VERIFY</span>
            </div>
          </div>
          
          <div className="footer">
            <span>Please arrive 30 minutes before departure • Valid ID required</span>
            <span>Total: {receipt.currency} {parseFloat(receipt.total).toLocaleString()}</span>
          </div>
        </div>
        
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn')?.addEventListener('click', function() { window.print(); });
        `}} />
        <button className="print-btn no-print">🎫 Print Ticket</button>
      </body>
    </html>
  );
}

function StandardReceipt({ receipt, branding, subtotal, laborCost, tax, discount, total }: {
  receipt: typeof receipts.$inferSelect;
  branding: BrandingData;
  subtotal: number;
  laborCost: number;
  tax: number;
  discount: number;
  total: number;
}) {
  const items = (receipt.items || []) as Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  const typeLabel = receipt.type === "event_receipt" ? "Event & Catering Receipt" : "Service Receipt";
  
  return (
    <html>
      <head>
        <title>{receipt.receiptNumber} - Receipt</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 20px; color: #1e293b; font-size: 12px; }
          @media print {
            body { background: white; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 15mm; }
          }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${receipt.type === "event_receipt" ? "#d97706" : "#7c3aed"} 0%, ${receipt.type === "event_receipt" ? "#b45309" : "#5b21b6"} 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 5px; }
          .header p { opacity: 0.8; font-size: 12px; }
          .header .receipt-num { font-family: monospace; font-size: 16px; font-weight: 600; margin-top: 15px; background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; }
          .section { padding: 25px 30px; border-bottom: 1px solid #e2e8f0; }
          .section h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item label { font-size: 10px; color: #94a3b8; display: block; margin-bottom: 3px; }
          .info-item p { font-size: 13px; font-weight: 500; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          th:last-child { text-align: right; }
          td { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
          td:last-child { text-align: right; font-weight: 500; }
          .totals { background: #f8fafc; padding: 25px 30px; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
          .totals-row.grand { font-size: 18px; font-weight: 700; border-top: 2px solid #1e293b; margin-top: 10px; padding-top: 15px; }
          .totals-row.grand .amount { color: ${receipt.type === "event_receipt" ? "#d97706" : "#7c3aed"}; }
          .paid-stamp { text-align: center; padding: 20px; }
          .paid-stamp span { display: inline-block; padding: 10px 30px; border: 3px solid #059669; color: #059669; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 8px; transform: rotate(-5deg); }
          .footer { padding: 20px 30px; text-align: center; font-size: 11px; color: #64748b; background: #f8fafc; }
          .print-btn { position: fixed; bottom: 20px; right: 20px; background: ${receipt.type === "event_receipt" ? "#d97706" : "#7c3aed"}; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>{branding.brandName || "FOUNDERS & FOOTSTEPS"}</h1>
            <p>{typeLabel}</p>
            <div className="receipt-num">{receipt.receiptNumber}</div>
          </div>
          
          <div className="section">
            <h3>Customer Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{receipt.customerName || "—"}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{receipt.customerPhone || "—"}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{receipt.customerEmail || "—"}</p>
              </div>
              <div className="info-item">
                <label>Date</label>
                <p>{new Date(receipt.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>
          
          {receipt.title && (
            <div className="section">
              <h3>Service Details</h3>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{receipt.title}</p>
              {receipt.description && <p style={{ color: "#64748b" }}>{receipt.description}</p>}
            </div>
          )}
          
          {items.length > 0 && (
            <div className="section">
              <h3>Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ textAlign: "center" }}>Qty</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td>{receipt.currency} {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{receipt.currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {tax > 0 && (
              <div className="totals-row">
                <span>Tax</span>
                <span>{receipt.currency} {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="totals-row">
                <span>Discount</span>
                <span>-{receipt.currency} {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="totals-row grand">
              <span>Total</span>
              <span className="amount">{receipt.currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          {receipt.status === "paid" && (
            <div className="paid-stamp">
              <span>✓ PAID</span>
            </div>
          )}
          
          <div className="footer">
            <p>Thank you for your business!</p>
            <p style={{ marginTop: 5 }}>{branding.phone} • {branding.email}</p>
          </div>
        </div>
        
        <script dangerouslySetInnerHTML={{ __html: `
          document.querySelector('.print-btn')?.addEventListener('click', function() { window.print(); });
        `}} />
        <button className="print-btn no-print">🖨️ Print Receipt</button>
      </body>
    </html>
  );
}
