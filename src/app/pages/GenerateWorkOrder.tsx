import { useState } from "react";
import { useStore, WorkOrder } from "../store";

type DraftConfig = { catId: string; approver1: string; approver2: string };
const EMPTY_DRAFT: DraftConfig = { catId: "", approver1: "", approver2: "" };

export default function GenerateWorkOrder() {
  const { orders, setOrders, categories, employees, workOrders, setWorkOrders } = useStore();

  const pendingOrders = orders.filter((o) => o.status === "pending");

  const [drafts, setDrafts] = useState<Record<string, DraftConfig>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDraft, setBulkDraft] = useState<DraftConfig>(EMPTY_DRAFT);
  const [successMsg, setSuccessMsg] = useState("");

  function getDraft(orderId: string): DraftConfig {
    return drafts[orderId] || EMPTY_DRAFT;
  }

  function updateDraft(orderId: string, patch: Partial<DraftConfig>) {
    setDrafts((d) => ({ ...d, [orderId]: { ...getDraft(orderId), ...patch } }));
  }

  function toggleSelect(orderId: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((s) => (s.size === pendingOrders.length ? new Set() : new Set(pendingOrders.map((o) => o.id))));
  }

  function applyBulkDraft() {
    setDrafts((d) => {
      const next = { ...d };
      selected.forEach((orderId) => {
        next[orderId] = {
          catId: bulkDraft.catId || getDraft(orderId).catId,
          approver1: bulkDraft.approver1 || getDraft(orderId).approver1,
          approver2: bulkDraft.approver2 || getDraft(orderId).approver2,
        };
      });
      return next;
    });
  }

  function generateOne(orderId: string, startCounter: number): WorkOrder | null {
    const draft = getDraft(orderId);
    const cat = categories.find((c) => c.id === draft.catId);
    if (!draft.catId || !draft.approver1 || !draft.approver2 || !cat) return null;

    return {
      id: `WO-${String(startCounter).padStart(3, "0")}`,
      orderId,
      categoryId: draft.catId,
      approver1Id: draft.approver1,
      approver2Id: draft.approver2,
      generatedDate: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }),
      currentStep: 0,
      stepStatuses: cat.workflow.map((_, i) => (i === 0 ? "in_progress" : "pending")),
    };
  }

  function generateSingle(orderId: string) {
    const wo = generateOne(orderId, workOrders.length + 1);
    if (!wo) return;
    setWorkOrders([...workOrders, wo]);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "work_order_generated" } : o)));
    setDrafts((d) => { const n = { ...d }; delete n[orderId]; return n; });
    setSelected((s) => { const n = new Set(s); n.delete(orderId); return n; });
    setSuccessMsg(`Work Order ${wo.id} generated successfully`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  function generateBulk() {
    const ready = Array.from(selected).filter((id) => {
      const d = getDraft(id);
      return d.catId && d.approver1 && d.approver2;
    });
    if (ready.length === 0) return;

    let counter = workOrders.length + 1;
    const newWorkOrders: WorkOrder[] = [];
    ready.forEach((orderId) => {
      const wo = generateOne(orderId, counter);
      if (wo) { newWorkOrders.push(wo); counter++; }
    });

    setWorkOrders([...workOrders, ...newWorkOrders]);
    setOrders(orders.map((o) => (ready.includes(o.id) ? { ...o, status: "work_order_generated" } : o)));
    setDrafts((d) => { const n = { ...d }; ready.forEach((id) => delete n[id]); return n; });
    setSelected((s) => { const n = new Set(s); ready.forEach((id) => n.delete(id)); return n; });
    setBulkDraft(EMPTY_DRAFT);
    setSuccessMsg(`${newWorkOrders.length} work order${newWorkOrders.length > 1 ? "s" : ""} generated successfully`);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

  const selectedReadyCount = Array.from(selected).filter((id) => {
    const d = getDraft(id);
    return d.catId && d.approver1 && d.approver2;
  }).length;

  const allSelected = pendingOrders.length > 0 && selected.size === pendingOrders.length;

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Generate Work Order</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Assign a print category and approvers to pending orders, then generate — one at a time or in bulk</p>
      </div>

      {successMsg && (
        <div className="mb-4 rounded-lg px-4 py-3 flex items-center gap-2" style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", color: "#059669", fontSize: 13, fontWeight: 500 }}>
          ✓ {successMsg}
        </div>
      )}

      {pendingOrders.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>All orders have been processed</p>
        </div>
      ) : (
        <>
          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div
              className="rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", whiteSpace: "nowrap" }}>
                {selected.size} selected
              </span>

              <select style={{ ...selSm, minWidth: 150 }} value={bulkDraft.catId} onChange={(e) => setBulkDraft((b) => ({ ...b, catId: e.target.value }))}>
                <option value="">Category…</option>
                {categories.filter((c) => c.active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>

              <select style={{ ...selSm, minWidth: 150 }} value={bulkDraft.approver1} onChange={(e) => setBulkDraft((b) => ({ ...b, approver1: e.target.value }))}>
                <option value="">Approver 1…</option>
                {employees.filter((e) => e.status === "active").map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <select style={{ ...selSm, minWidth: 150 }} value={bulkDraft.approver2} onChange={(e) => setBulkDraft((b) => ({ ...b, approver2: e.target.value }))}>
                <option value="">Approver 2…</option>
                {employees.filter((e) => e.status === "active" && e.id !== bulkDraft.approver1).map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <button
                onClick={applyBulkDraft}
                disabled={!bulkDraft.catId && !bulkDraft.approver1 && !bulkDraft.approver2}
                style={{
                  fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 6, border: "1px solid #93c5fd",
                  background: "white", color: "#2563EB", cursor: "pointer",
                  opacity: (!bulkDraft.catId && !bulkDraft.approver1 && !bulkDraft.approver2) ? 0.5 : 1,
                }}
              >
                Apply to selected
              </button>

              <button
                onClick={generateBulk}
                disabled={selectedReadyCount === 0}
                style={{
                  fontSize: 12, fontWeight: 700, padding: "7px 14px", borderRadius: 6, border: "none",
                  background: "#2563EB", color: "white", cursor: selectedReadyCount === 0 ? "not-allowed" : "pointer",
                  opacity: selectedReadyCount === 0 ? 0.5 : 1, marginLeft: "auto",
                }}
              >
                Generate {selectedReadyCount > 0 ? `${selectedReadyCount} ` : ""}Work Order{selectedReadyCount === 1 ? "" : "s"}
              </button>

              <button
                onClick={() => setSelected(new Set())}
                style={{ fontSize: 12, color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
          )}

          <div className="rounded-xl" style={{ background: "white", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "10px 14px", width: 36 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  </th>
                  {["Order", "Item", "Buyer", "Qty", "Total", "Date", "Category", "Approver 1", "Approver 2", ""].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((o) => {
                  const draft = getDraft(o.id);
                  const isChecked = selected.has(o.id);
                  const canGenerate = !!(draft.catId && draft.approver1 && draft.approver2);

                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6", background: isChecked ? "#f9fafb" : "white" }}>
                      <td style={{ padding: "10px 14px" }}>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleSelect(o.id)} />
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>{o.id}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280", maxWidth: 200 }}>
                        {o.itemName.slice(0, 40)}{o.itemName.length > 40 ? "..." : ""}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{o.buyer}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>{o.quantity}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>${o.total.toFixed(2)}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{o.orderDate}</td>

                      <td style={{ padding: "10px 14px" }}>
                        <select style={selSm} value={draft.catId} onChange={(e) => updateDraft(o.id, { catId: e.target.value })}>
                          <option value="">Select…</option>
                          {categories.filter((c) => c.active).map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <select style={selSm} value={draft.approver1} onChange={(e) => updateDraft(o.id, { approver1: e.target.value })}>
                          <option value="">Select…</option>
                          {employees.filter((e) => e.status === "active").map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <select style={selSm} value={draft.approver2} onChange={(e) => updateDraft(o.id, { approver2: e.target.value })}>
                          <option value="">Select…</option>
                          {employees.filter((e) => e.status === "active" && e.id !== draft.approver1).map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </td>

                      <td style={{ padding: "10px 14px" }}>
                        <button
                          onClick={() => generateSingle(o.id)}
                          disabled={!canGenerate}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 6, border: "none",
                            background: canGenerate ? "#2563EB" : "#e5e7eb", color: canGenerate ? "white" : "#9ca3af",
                            cursor: canGenerate ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                          }}
                        >
                          Generate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const selSm: React.CSSProperties = {
  padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12,
  color: "#374151", outline: "none", background: "white", maxWidth: 150,
};