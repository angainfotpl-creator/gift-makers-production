import { useState } from "react";
import { useStore, Batch } from "../store";

export default function Dispatch() {
  const { orders, setOrders, batches, setBatches, categories } = useStore();

  const readyOrders = orders.filter((o) => o.status === "qc_done");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchName, setBatchName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [area, setArea] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function toggleSelect(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function selectAll() {
    setSelectedIds(selectedIds.length === readyOrders.length ? [] : readyOrders.map((o) => o.id));
  }

  function dispatchBatch() {
    if (!batchName.trim() || !agentName.trim() || !area.trim() || selectedIds.length === 0) return;
    const batch: Batch = {
      id: `BATCH-${String(batches.length + 1).padStart(3, "0")}`,
      name: batchName, orderIds: [...selectedIds], agentName, area,
      dispatchDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
    };
    setBatches([...batches, batch]);
    setOrders(orders.map((o) => selectedIds.includes(o.id) ? { ...o, status: "dispatched" } : o));
    setSelectedIds([]); setBatchName(""); setAgentName(""); setArea(""); setShowForm(false);
    setSuccessMsg(`Batch ${batch.id} dispatched with ${batch.orderIds.length} orders`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Dispatch</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Batch and dispatch QC-cleared orders to area agents</p>
        </div>
        {selectedIds.length > 0 && !showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Batch ({selectedIds.length} selected)
          </button>
        )}
        {showForm && (
          <button className="btn-secondary" onClick={() => setShowForm(false)}>← Back</button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center gap-2" style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#059669", fontSize: 13, fontWeight: 500 }}>
          🚚 {successMsg}
        </div>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: showForm ? "1fr 380px" : "1fr" }}>
        {/* Ready Orders */}
        <div>
          {readyOrders.length === 0 && !showForm ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "white", border: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 36, marginBottom: 8 }}>📦</p>
              <p style={{ fontSize: 14, color: "#9ca3af" }}>No orders cleared for dispatch yet. Orders move here after QC completion.</p>
            </div>
          ) : (
            <>
              {readyOrders.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>QC Cleared Orders ({readyOrders.length})</h2>
                    <button onClick={selectAll} style={{ fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                      {selectedIds.length === readyOrders.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden mb-5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}></th>
                          <th>Order ID</th>
                          <th>Item</th>
                          <th>Buyer</th>
                          <th>Qty</th>
                          <th>Ship To</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readyOrders.map((o) => {
                          const checked = selectedIds.includes(o.id);
                          return (
                            <tr key={o.id} style={{ cursor: "pointer", background: checked ? "#f0f9ff" : "white" }} onClick={() => toggleSelect(o.id)}>
                              <td>
                                <input type="checkbox" checked={checked} onChange={() => toggleSelect(o.id)} style={{ accentColor: "#2563EB", width: 15, height: 15, cursor: "pointer" }} onClick={(e) => e.stopPropagation()} />
                              </td>
                              <td style={{ fontWeight: 600, color: "#2563EB", fontSize: 13 }}>{o.id}</td>
                              <td style={{ maxWidth: 200 }}>
                                <p style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.itemName}</p>
                              </td>
                              <td style={{ fontSize: 13 }}>{o.buyer}</td>
                              <td style={{ fontSize: 13, textAlign: "center" }}>{o.quantity}</td>
                              <td style={{ fontSize: 12, color: "#6b7280" }}>{o.shipCity}, {o.shipState}, {o.shipCountry}</td>
                              <td style={{ fontSize: 13, fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {/* Dispatched Batches */}
          {batches.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Dispatched Batches ({batches.length})</h2>
              <div className="flex flex-col gap-3">
                {batches.map((b) => {
                  const batchOrders = orders.filter((o) => b.orderIds.includes(o.id));
                  const totalValue = batchOrders.reduce((sum, o) => sum + o.total, 0);
                  return (
                    <div key={b.id} className="rounded-xl p-4" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: "#f0fdf4" }}>
                            <span style={{ fontSize: 20 }}>🚚</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{b.id}</span>
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>·</span>
                              <span style={{ fontSize: 13, color: "#374151" }}>{b.name}</span>
                            </div>
                            <p style={{ fontSize: 12, color: "#6b7280" }}>Agent: {b.agentName} · Area: {b.area}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span className="badge" style={{ background: "#ecfdf5", color: "#059669", marginBottom: 4, display: "inline-block" }}>Dispatched</span>
                          <p style={{ fontSize: 11, color: "#9ca3af" }}>Date: {b.dispatchDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
                        <div style={{ fontSize: 12, color: "#6b7280" }}><strong style={{ color: "#111827" }}>{b.orderIds.length}</strong> orders</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Total: <strong style={{ color: "#111827" }}>${totalValue.toFixed(2)}</strong></div>
                        <div className="flex flex-wrap gap-1 ml-auto">
                          {b.orderIds.slice(0, 5).map((id) => (
                            <span key={id} style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "2px 6px", borderRadius: 4 }}>{id}</span>
                          ))}
                          {b.orderIds.length > 5 && <span style={{ fontSize: 11, color: "#9ca3af" }}>+{b.orderIds.length - 5} more</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dispatch Form */}
        {showForm && (
          <div className="rounded-xl p-5 sticky top-0" style={{ background: "white", border: "1px solid #e5e7eb", height: "fit-content" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Create Dispatch Batch</h2>

            {/* Summary */}
            <div className="rounded-lg p-3 mb-4" style={{ background: "#ecfdf5", border: "1px solid #bbf7d0" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#059669", marginBottom: 6 }}>SELECTED ORDERS</p>
              <div className="flex flex-wrap gap-1">
                {selectedIds.map((id) => (
                  <span key={id} style={{ fontSize: 11, background: "white", color: "#374151", padding: "2px 6px", borderRadius: 4, border: "1px solid #d1d5db" }}>{id}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#059669", marginTop: 8 }}>
                Total Value: ${orders.filter((o) => selectedIds.includes(o.id)).reduce((s, o) => s + o.total, 0).toFixed(2)}
              </p>
            </div>

            <div className="mb-3">
              <label style={lbl}>Batch Name *</label>
              <input style={inp} value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. Morning Dispatch Batch 1" />
            </div>
            <div className="mb-3">
              <label style={lbl}>Agent Name *</label>
              <input style={inp} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="mb-5">
              <label style={lbl}>Delivery Area *</label>
              <input style={inp} value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. South Zone, Chennai" />
            </div>

            <button
              className="btn-primary"
              onClick={dispatchBatch}
              disabled={!batchName || !agentName || !area}
              style={{ width: "100%", opacity: (!batchName || !agentName || !area) ? 0.5 : 1, cursor: (!batchName || !agentName || !area) ? "not-allowed" : "pointer" }}
            >
              🚚 Dispatch Batch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, color: "#374151", outline: "none" };
