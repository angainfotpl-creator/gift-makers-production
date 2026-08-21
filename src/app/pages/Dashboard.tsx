import { useStore } from "../store";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { employees, categories, orders, workOrders, batches } = useStore();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Employees", value: employees.length, sub: `${employees.filter((e) => e.status === "active").length} active`, color: "#2563EB", bg: "#eff6ff", icon: "👥" },
    { label: "Print Categories", value: categories.length, sub: `${categories.filter((c) => c.active).length} active`, color: "#7c3aed", bg: "#f5f3ff", icon: "🖨️" },
    { label: "Total Orders", value: orders.length, sub: `${orders.filter((o) => o.status === "pending").length} pending`, color: "#d97706", bg: "#fffbeb", icon: "📦" },
    { label: "Work Orders", value: workOrders.length, sub: `${workOrders.filter((w) => w.stepStatuses.every((s) => s === "completed")).length} completed`, color: "#059669", bg: "#ecfdf5", icon: "📋" },
    { label: "Dispatched Batches", value: batches.length, sub: "total dispatched", color: "#dc2626", bg: "#fef2f2", icon: "🚚" },
  ];

  const recentOrders = orders.slice(0, 5);

  const statusColors: Record<string, string> = {
    pending: "#d97706",
    work_order_generated: "#2563EB",
    in_production: "#7c3aed",
    qc_done: "#059669",
    dispatched: "#374151",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    work_order_generated: "Work Order Generated",
    in_production: "In Production",
    qc_done: "QC Done",
    dispatched: "Dispatched",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>August 21, 2026</div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "white", border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-start justify-between mb-3">
              <p style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 300px" }}>
        <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Recent Orders</h2>
            <button onClick={() => navigate("/orders/create")} style={{ fontSize: 12, color: "#2563EB", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}>View All →</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item</th>
                <th>Buyer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: "#2563EB", fontSize: 13 }}>{o.id}</td>
                  <td style={{ maxWidth: 200 }}>
                    <p style={{ fontSize: 13, color: "#111827", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.itemName}</p>
                  </td>
                  <td style={{ fontSize: 13 }}>{o.buyer}</td>
                  <td style={{ fontSize: 13 }}>{o.quantity}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                  <td>
                    <span
                      className="badge"
                      style={{ background: statusColors[o.status] + "18", color: statusColors[o.status], fontSize: 11 }}
                    >
                      {statusLabels[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl p-5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Quick Actions</h2>
          {[
            { label: "Add Employee", to: "/employees", icon: "👤", color: "#2563EB" },
            { label: "Create Category", to: "/categories", icon: "🖨️", color: "#7c3aed" },
            { label: "Create Order", to: "/orders/create", icon: "📦", color: "#d97706" },
            { label: "Generate Work Order", to: "/orders/generate", icon: "📋", color: "#059669" },
            { label: "View Dispatch", to: "/dispatch", icon: "🚚", color: "#dc2626" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2 mb-2 text-left"
              style={{ background: "#f9fafb", border: "1px solid #e5e7eb", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f3f4f6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
            >
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{a.label}</span>
              <span style={{ marginLeft: "auto", color: a.color }}>→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
