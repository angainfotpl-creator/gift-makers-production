import { useState, useRef } from "react";
import { useStore, Order } from "../store";

type FormData = Omit<Order, "id" | "status">;
const EMPTY: FormData = {
  orderDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
  itemName: "", buyer: "", quantity: 1, price: 0, total: 0,
  shipName: "", shipAddress: "", shipCity: "", shipState: "", shipZip: "", shipCountry: "United States",
  transactionId: "", variations: "",
};

type Tab = "list" | "csv" | "form";

export default function CreateOrder() {
  const { orders, setOrders } = useStore();
  const [tab, setTab] = useState<Tab>("list");
  const [form, setForm] = useState<FormData>(EMPTY);
  const [csvPreview, setCsvPreview] = useState<FormData[]>([]);
  const [csvError, setCsvError] = useState("");
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const statusColors: Record<string, string> = {
    pending: "#d97706", work_order_generated: "#2563EB",
    in_production: "#7c3aed", qc_done: "#059669", dispatched: "#374151",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pending", work_order_generated: "Work Order Generated",
    in_production: "In Production", qc_done: "QC Done", dispatched: "Dispatched",
  };

  const filtered = orders.filter(
    (o) => o.id.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase()) || o.itemName.toLowerCase().includes(search.toLowerCase())
  );

  function handleCSV(file: File) {
    setCsvError(""); setCsvPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) { setCsvError("CSV file has no data rows."); return; }
      const parsed: FormData[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVLine(lines[i]);
        if (row.length < 20) continue;
        parsed.push({
          orderDate: row[0]?.replace(/"/g, "") || "",
          itemName: row[1]?.replace(/"/g, "") || "",
          buyer: row[2]?.replace(/"/g, "") || "",
          quantity: parseInt(row[3]) || 1,
          price: parseFloat(row[4]) || 0,
          total: parseFloat(row[11]) || 0,
          transactionId: row[13]?.replace(/"/g, "") || "",
          shipName: row[17]?.replace(/"/g, "") || "",
          shipAddress: row[18]?.replace(/"/g, "") || "",
          shipCity: row[20]?.replace(/"/g, "") || "",
          shipState: row[21]?.replace(/"/g, "") || "",
          shipZip: row[22]?.replace(/"/g, "") || "",
          shipCountry: row[23]?.replace(/"/g, "") || "",
          variations: row[25]?.replace(/"/g, "") || "",
        });
      }
      if (parsed.length === 0) { setCsvError("No valid rows found in CSV."); return; }
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  }

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let cur = ""; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { result.push(cur); cur = ""; }
      else { cur += ch; }
    }
    result.push(cur);
    return result;
  }

  function importCSV() {
    const newOrders = csvPreview.map((r, i) => ({ ...r, id: `ORD-${String(orders.length + i + 1).padStart(3, "0")}`, status: "pending" as const }));
    setOrders([...orders, ...newOrders]);
    setCsvPreview([]); setTab("list");
    flash(`${newOrders.length} orders imported successfully`);
  }

  function handleFormSubmit() {
    if (!form.itemName.trim() || !form.buyer.trim()) return;
    const newOrder: Order = {
      ...form,
      total: form.quantity * form.price,
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      status: "pending",
      transactionId: form.transactionId || `TXN-${Date.now()}`,
    };
    setOrders([...orders, newOrder]);
    setForm(EMPTY); setTab("list");
    flash("Order created successfully");
  }

  function flash(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  function deleteOrder(id: string) {
    setOrders(orders.filter((o) => o.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Create Order</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{orders.length} total orders</p>
        </div>
        {tab === "list" && (
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => setTab("csv")}>
              <span>📄 Import CSV</span>
            </button>
            <button className="btn-primary" onClick={() => setTab("form")}>+ Manual Entry</button>
          </div>
        )}
        {tab !== "list" && (
          <button className="btn-secondary" onClick={() => { setTab("list"); setCsvPreview([]); }}>← Back</button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center gap-2" style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#059669", fontSize: 13, fontWeight: 500 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Orders Table */}
      {tab === "list" && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 rounded-lg px-3" style={{ height: 36, background: "white", border: "1px solid #e5e7eb", maxWidth: 300, width: "100%" }}>
              <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#374151", width: "100%" }} />
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Buyer</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Ship To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>No orders found</td></tr>
                )}
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600, color: "#2563EB", fontSize: 13 }}>{o.id}</td>
                    <td style={{ fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{o.orderDate}</td>
                    <td style={{ maxWidth: 220 }}>
                      <p style={{ fontSize: 13, color: "#111827", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.itemName}>{o.itemName}</p>
                      {o.variations && <p style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.variations}</p>}
                    </td>
                    <td style={{ fontSize: 13 }}>{o.buyer}</td>
                    <td style={{ fontSize: 13, textAlign: "center" }}>{o.quantity}</td>
                    <td style={{ fontSize: 13, fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                    <td style={{ fontSize: 12, color: "#6b7280" }}>{o.shipCity}, {o.shipState}</td>
                    <td>
                      <span className="badge" style={{ background: (statusColors[o.status] || "#374151") + "18", color: statusColors[o.status] || "#374151", fontSize: 11 }}>
                        {statusLabels[o.status] || o.status}
                      </span>
                    </td>
                    <td>
                      {o.status === "pending" && (
                        <button onClick={() => deleteOrder(o.id)} style={{ fontSize: 11, color: "#dc2626", background: "#fef2f2", border: "none", padding: "3px 8px", borderRadius: 4, cursor: "pointer" }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CSV Import */}
      {tab === "csv" && (
        <div>
          <div
            className="rounded-xl p-10 text-center mb-4"
            style={{ background: "white", border: "2px dashed #d1d5db", cursor: "pointer" }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCSV(f); }}
          >
            <p style={{ fontSize: 40, marginBottom: 8 }}>📄</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Drop your CSV file here</p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>or click to browse — supports Etsy/store export format</p>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCSV(f); }} />
          </div>
          {csvError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>⚠️ {csvError}</p>}
          {csvPreview.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{csvPreview.length} orders ready to import</p>
                <button className="btn-primary" onClick={importCSV}>Import {csvPreview.length} Orders</button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th><th>Item</th><th>Buyer</th><th>Qty</th><th>Total</th><th>Ship To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 12, whiteSpace: "nowrap" }}>{r.orderDate}</td>
                          <td style={{ maxWidth: 200 }}><p style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.itemName}</p></td>
                          <td style={{ fontSize: 12 }}>{r.buyer}</td>
                          <td style={{ fontSize: 12, textAlign: "center" }}>{r.quantity}</td>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>${r.total.toFixed(2)}</td>
                          <td style={{ fontSize: 12 }}>{r.shipCity}, {r.shipState}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual Form */}
      {tab === "form" && (
        <div className="rounded-xl p-6 max-w-3xl" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 20 }}>New Order</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={lbl}>Item Name *</label>
              <input style={inp} value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="e.g. Personalized Birthday Bag" />
            </div>
            <div>
              <label style={lbl}>Buyer Name *</label>
              <input style={inp} value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} placeholder="e.g. Dana Maiorino" />
            </div>
            <div>
              <label style={lbl}>Quantity</label>
              <input type="number" min="1" style={inp} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1, total: (parseInt(e.target.value) || 1) * form.price })} />
            </div>
            <div>
              <label style={lbl}>Unit Price ($)</label>
              <input type="number" min="0" step="0.01" style={inp} value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0, total: form.quantity * (parseFloat(e.target.value) || 0) })} />
            </div>
            <div>
              <label style={lbl}>Order Date</label>
              <input style={inp} value={form.orderDate} onChange={(e) => setForm({ ...form, orderDate: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Transaction ID</label>
              <input style={inp} value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder="e.g. 5185544811" />
            </div>
            <div>
              <label style={lbl}>Variations</label>
              <input style={inp} value={form.variations} onChange={(e) => setForm({ ...form, variations: e.target.value })} placeholder="e.g. Size:10*12, Minnie Design" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, marginTop: 4 }}>Shipping Details</p>
            </div>
            <div>
              <label style={lbl}>Ship To Name</label>
              <input style={inp} value={form.shipName} onChange={(e) => setForm({ ...form, shipName: e.target.value })} placeholder="Recipient name" />
            </div>
            <div style={{ gridColumn: "2 / -1" }}>
              <label style={lbl}>Address</label>
              <input style={inp} value={form.shipAddress} onChange={(e) => setForm({ ...form, shipAddress: e.target.value })} placeholder="Street address" />
            </div>
            <div>
              <label style={lbl}>City</label>
              <input style={inp} value={form.shipCity} onChange={(e) => setForm({ ...form, shipCity: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>State</label>
              <input style={inp} value={form.shipState} onChange={(e) => setForm({ ...form, shipState: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>ZIP</label>
              <input style={inp} value={form.shipZip} onChange={(e) => setForm({ ...form, shipZip: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Country</label>
              <input style={inp} value={form.shipCountry} onChange={(e) => setForm({ ...form, shipCountry: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 14, color: "#374151" }}>
              Order Total: <strong style={{ fontSize: 18, color: "#111827" }}>${(form.quantity * form.price).toFixed(2)}</strong>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary" onClick={() => setTab("list")}>Cancel</button>
              <button className="btn-primary" onClick={handleFormSubmit}>Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, color: "#374151", outline: "none" };
