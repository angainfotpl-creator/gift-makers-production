import { Outlet, NavLink, useLocation } from "react-router";
import { useState } from "react";
import { useStore } from "./store";
import giftMakersLogo from "../assets/gift-makers.png";

const NAV = [
  {
    group: "OVERVIEW",
    items: [{ to: "/", label: "Dashboard", icon: IconDashboard }],
  },
  {
    group: "WORKFORCE",
    items: [{ to: "/employees", label: "Employees", icon: IconUsers }],
  },
  {
    group: "MASTERS",
    items: [
      { to: "/categories", label: "Categories & Process", icon: IconGrid },
    ],
  },
  {
    group: "ORDER MANAGEMENT",
    items: [
      { to: "/orders/create", label: "Create Order", icon: IconPlus },
      {
        to: "/orders/generate",
        label: "Generate Work Order",
        icon: IconClipboard,
      },
    ],
  },
  {
    group: "PRODUCTION",
    items: [
      { to: "/tracking", label: "Order Tracking", icon: IconTracking },
      { to: "/dispatch", label: "Dispatch", icon: IconDispatch },
    ],
  },
];

export default function Root() {
  const location = useLocation();
  const { orders, workOrders } = useStore();
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const readyDispatch = orders.filter((o) => o.status === "qc_done").length;
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f3f4f6" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 h-full overflow-y-auto"
        style={{
          width: 240,
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        {/* Client Logo */}
        <div
          className="flex items-center justify-center px-5 py-4"
          style={{
            borderBottom: "1px solid #f3f4f6",
            minHeight: 80,
          }}
        >
          <img
            src={giftMakersLogo}
            alt="Gift Makers"
            style={{
              width: "100%",
              maxWidth: 190,
              height: 48,
              objectFit: "contain",
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          {NAV.map((section) => (
            <div key={section.group} className="mb-5">
              <p
                className="px-3 mb-1"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                {section.group}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                    style={{ marginBottom: 2 }}
                  >
                    <Icon size={16} active={isActive} />
                    <span>{item.label}</span>
                    {item.to === "/orders/generate" && pendingOrders > 0 && (
                      <span
                        className="ml-auto"
                        style={{
                          background: "#2563EB",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "1px 7px",
                          borderRadius: 9999,
                        }}
                      >
                        {pendingOrders}
                      </span>
                    )}
                    {item.to === "/dispatch" && readyDispatch > 0 && (
                      <span
                        className="ml-auto"
                        style={{
                          background: "#10b981",
                          color: "white",
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "1px 7px",
                          borderRadius: 9999,
                        }}
                      >
                        {readyDispatch}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-3" style={{ borderTop: "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-full text-white font-semibold"
              style={{
                width: 32,
                height: 32,
                background: "#6366f1",
                fontSize: 13,
              }}
            >
              AD
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                Admin
              </p>
              <p style={{ fontSize: 11, color: "#9ca3af" }}>
                admin@printflow.in
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 flex-shrink-0"
          style={{
            height: 60,
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Breadcrumb pathname={location.pathname} />
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-lg px-3"
              style={{
                height: 36,
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="Search..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#374151",
                  width: 160,
                }}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {pendingOrders + readyDispatch > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 8,
                      height: 8,
                      background: "#ef4444",
                      borderRadius: "50%",
                      border: "1px solid white",
                    }}
                  />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const map: Record<string, string[]> = {
    "/": ["Home"],
    "/employees": ["Home", "Workforce", "Employees"],
    "/categories": ["Home", "Masters", "Categories & Process"],
    "/orders/create": ["Home", "Order Management", "Create Order"],
    "/orders/generate": ["Home", "Order Management", "Generate Work Order"],
    "/tracking": ["Home", "Production", "Order Tracking"],
    "/dispatch": ["Home", "Production", "Dispatch"],
  };
  const crumbs = map[pathname] || ["Home"];
  return (
    <div
      className="flex items-center gap-1"
      style={{ fontSize: 13, color: "#9ca3af" }}
    >
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span style={{ color: "#d1d5db" }}>›</span>}
          <span
            style={{
              color: i === crumbs.length - 1 ? "#111827" : "#9ca3af",
              fontWeight: i === crumbs.length - 1 ? 600 : 400,
            }}
          >
            {c}
          </span>
        </span>
      ))}
    </div>
  );
}

function IconDashboard({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconUsers({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconGrid({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 0-14.14 0" />
      <path d="M21.42 10.74A10 10 0 0 0 12 2" />
      <path d="M12 22a10 10 0 0 0 9.42-6.74" />
      <path d="M4.93 19.07A10 10 0 0 0 12 22" />
      <path d="M2.58 13.26A10 10 0 0 0 12 22" />
      <path d="M2 12a10 10 0 0 1 2.58-6.74" />
    </svg>
  );
}
function IconPlus({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IconClipboard({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
}
function IconTracking({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconDispatch({ size = 16, active = false }) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      stroke={active ? "#2563EB" : "#6b7280"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
