import { useState } from "react";
import { useStore } from "../store";

const STATUS_COLOR: Record<string, string> = {
  pending: "#9ca3af",
  in_progress: "#2563EB",
  completed: "#10b981",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  work_order_generated: "Work Order Generated",
  in_production: "In Production",
  qc_done: "QC Done",
  dispatched: "Dispatched",
};
const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: "#d97706", work_order_generated: "#2563EB",
  in_production: "#7c3aed", qc_done: "#059669", dispatched: "#374151",
};

function initials(name?: string) {
  return name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "?";
}

export default function OrderTracking() {
  const { workOrders, orders, categories, employees } = useStore();
  const [activeWoId, setActiveWoId] = useState<string | null>(null);

  const trackableWorkOrders = workOrders.filter((wo) => {
    const order = orders.find((o) => o.id === wo.orderId);
    return order && order.status !== "pending";
  });

  const activeWo = trackableWorkOrders.find((wo) => wo.id === activeWoId) || null;

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Order Tracking</h1>
        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Real-time status of all active production work orders</p>
      </div>

      {/* Summary Bar */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { label: "In Production", count: orders.filter((o) => o.status === "in_production").length, color: "#7c3aed", bg: "#f5f3ff" },
          { label: "Work Order Gen.", count: orders.filter((o) => o.status === "work_order_generated").length, color: "#2563EB", bg: "#eff6ff" },
          { label: "QC Done", count: orders.filter((o) => o.status === "qc_done").length, color: "#059669", bg: "#ecfdf5" },
          { label: "Dispatched", count: orders.filter((o) => o.status === "dispatched").length, color: "#374151", bg: "#f3f4f6" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</p>
            <p style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {trackableWorkOrders.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>📊</p>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>No work orders in production yet. Generate work orders first.</p>
        </div>
      ) : (
        <div className="rounded-xl" style={{ background: "white", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Work Order", "Order", "Item", "Category", "Buyer", "Qty", "Current Stage", "Progress", "Ship To", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.3 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trackableWorkOrders.map((wo) => {
                const order = orders.find((o) => o.id === wo.orderId);
                const cat = categories.find((c) => c.id === wo.categoryId);
                if (!order || !cat) return null;

                const done = wo.stepStatuses.filter((s) => s === "completed").length;
                const total = wo.stepStatuses.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                const currentStepIdx = wo.stepStatuses.findIndex((s) => s === "in_progress");
                const currentStepName =
                  currentStepIdx >= 0
                    ? cat.workflow[currentStepIdx]?.name
                    : pct === 100
                    ? "Finished"
                    : cat.workflow[Math.min(done, cat.workflow.length - 1)]?.name;

                return (
                  <tr
                    key={wo.id}
                    onClick={() => setActiveWoId(wo.id)}
                    style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap" }}>{wo.id}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{order.id}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", maxWidth: 220 }}>
                      {order.itemName.slice(0, 40)}{order.itemName.length > 40 ? "..." : ""}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 4 }}>{cat.name}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>{order.buyer}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280" }}>{order.quantity}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: pct === 100 ? "#10b981" : "#2563EB", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{currentStepName || "—"}</span>
                      </div>
                      <span className="badge" style={{ marginTop: 4, display: "inline-block", background: (ORDER_STATUS_COLOR[order.status] || "#374151") + "18", color: ORDER_STATUS_COLOR[order.status] || "#374151", fontSize: 10 }}>
                        {ORDER_STATUS_LABEL[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 120 }}>
                      <div className="flex items-center gap-2">
                        <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#10b981" : "#2563EB", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#9ca3af", width: 30 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{order.shipCity}, {order.shipCountry}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveWoId(wo.id); }}
                        title="Track order"
                        style={{
                          width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb",
                          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeWo && (
        <TrackingModal
          wo={activeWo}
          order={orders.find((o) => o.id === activeWo.orderId)}
          cat={categories.find((c) => c.id === activeWo.categoryId)}
          a1={employees.find((e) => e.id === activeWo.approver1Id)}
          a2={employees.find((e) => e.id === activeWo.approver2Id)}
          onClose={() => setActiveWoId(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

function TrackingModal({ wo, order, cat, a1, a2, onClose }: any) {
  if (!order || !cat) return null;

  const done = wo.stepStatuses.filter((s: string) => s === "completed").length;
  const total = wo.stepStatuses.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(17,24,39,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl p-5"
        style={{ background: "white", width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto", border: "1px solid #e5e7eb" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2563EB" }}>{wo.id}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{order.id}</span>
              </div>
              <p style={{ fontSize: 12, color: "#6b7280", maxWidth: 400 }}>{order.itemName}</p>
              <div className="flex items-center gap-3 mt-1">
                <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 4 }}>{cat.name}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Buyer: {order.buyer}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>Qty: {order.quantity}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge" style={{ background: (ORDER_STATUS_COLOR[order.status] || "#374151") + "18", color: ORDER_STATUS_COLOR[order.status] || "#374151" }}>
              {ORDER_STATUS_LABEL[order.status] || order.status}
            </span>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{pct}%</p>
              <p style={{ fontSize: 11, color: "#9ca3af" }}>complete</p>
            </div>
            <button
              onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 14, color: "#6b7280" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4" style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#10b981" : "#2563EB", borderRadius: 3, transition: "width 0.5s" }} />
        </div>

        {/* Workflow Steps */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {cat.workflow.map((step: any, i: number) => {
            const status = wo.stepStatuses[i] || "pending";
            return (
              <div key={step.id} className="flex items-center gap-1">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: status === "completed" ? "#ecfdf5" : status === "in_progress" ? "#eff6ff" : "#f9fafb", border: `1px solid ${STATUS_COLOR[status]}33` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[status], flexShrink: 0 }}>
                    {status === "in_progress" && (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", animation: "pulse 1.5s infinite" }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: status === "completed" ? "#059669" : status === "in_progress" ? "#2563EB" : "#9ca3af" }}>{step.name}</p>
                    <p style={{ fontSize: 10, color: "#9ca3af" }}>{step.minTime}–{step.maxTime}h</p>
                  </div>
                  {status === "completed" && <span style={{ color: "#10b981", fontSize: 12 }}>✓</span>}
                  {status === "in_progress" && (
                    <span style={{ width: 10, height: 10, border: "2px solid #2563EB", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 1s linear infinite" }} />
                  )}
                </div>
                {i < cat.workflow.length - 1 && (
                  <span style={{ color: status === "completed" ? "#10b981" : "#d1d5db", fontSize: 16 }}>→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Approvers + Dates */}
        <div className="flex items-center gap-6 pt-3" style={{ borderTop: "1px solid #f3f4f6" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>
              {initials(a1?.name)}
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#9ca3af" }}>Approver 1</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{a1?.name || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 700 }}>
              {initials(a2?.name)}
            </div>
            <div>
              <p style={{ fontSize: 10, color: "#9ca3af" }}>Approver 2</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{a2?.name || "Unknown"}</p>
            </div>
          </div>
          <div className="ml-auto">
            <p style={{ fontSize: 11, color: "#9ca3af" }}>Generated: {wo.generatedDate}</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>Ship to: {order.shipCity}, {order.shipCountry}</p>
          </div>
        </div>
      </div>
    </div>
  );
}