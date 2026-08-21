import { useState } from "react";
import { useStore, Employee } from "../store";

type Form = Omit<Employee, "id">;
const EMPTY: Form = { name: "", role: "", email: "", phone: "", department: "", status: "active" };
const ROLES = ["Designer", "Operator", "QC Inspector", "Cutter", "Finisher", "Supervisor", "Packing Staff"];
const DEPTS = ["Design", "Production", "Quality", "Packing", "Dispatch", "Management"];

export default function EmployeeManagement() {
  const { employees, setEmployees } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  function handleSubmit() {
    if (!form.name.trim() || !form.role || !form.email.trim()) return;
    if (editId) {
      setEmployees(employees.map((e) => (e.id === editId ? { ...form, id: editId } : e)));
      setEditId(null);
    } else {
      setEmployees([...employees, { ...form, id: `e${Date.now()}` }]);
    }
    setForm(EMPTY);
    setShowForm(false);
  }

  function handleEdit(emp: Employee) {
    setForm({ name: emp.name, role: emp.role, email: emp.email, phone: emp.phone, department: emp.department, status: emp.status });
    setEditId(emp.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    setEmployees(employees.filter((e) => e.id !== id));
    setDeleteId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Employee Management</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{employees.length} employees in your organisation</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY); }}>
          + Add Employee
        </button>
      </div>

      {/* Search + stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2 rounded-lg px-3 flex-1 max-w-xs" style={{ height: 36, background: "white", border: "1px solid #e5e7eb" }}>
          <svg width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#374151", width: "100%" }}
          />
        </div>
        <div className="flex gap-3">
          {["active", "inactive"].map((s) => (
            <div key={s} className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: s === "active" ? "#ecfdf5" : "#f3f4f6", fontSize: 12 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s === "active" ? "#10b981" : "#9ca3af", display: "inline-block" }} />
              <span style={{ color: s === "active" ? "#059669" : "#6b7280", fontWeight: 500 }}>
                {employees.filter((e) => e.status === s).length} {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #e5e7eb" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#9ca3af", padding: 32 }}>No employees found</td></tr>
            )}
            {filtered.map((emp, i) => (
              <tr key={emp.id}>
                <td style={{ color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full text-white font-semibold" style={{ width: 30, height: 30, background: "#6366f1", fontSize: 12, flexShrink: 0 }}>
                      {emp.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: 13, color: "#111827" }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{emp.role}</td>
                <td style={{ fontSize: 13 }}>{emp.department}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{emp.email}</td>
                <td style={{ fontSize: 13, color: "#6b7280" }}>{emp.phone}</td>
                <td>
                  <span className="badge" style={{ background: emp.status === "active" ? "#ecfdf5" : "#f3f4f6", color: emp.status === "active" ? "#059669" : "#6b7280" }}>
                    {emp.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(emp)} style={{ fontSize: 12, color: "#2563EB", background: "#eff6ff", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}>Edit</button>
                    <button onClick={() => setDeleteId(emp.id)} style={{ fontSize: 12, color: "#dc2626", background: "#fef2f2", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal title={editId ? "Edit Employee" : "Add Employee"} onClose={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Field label="Full Name *">
              <input className="field-input" placeholder="e.g. Arjun Mehta" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Role *">
              <select className="field-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">Select Role</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Email *">
              <input className="field-input" type="email" placeholder="e.g. arjun@printflow.in" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className="field-input" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Department">
              <select className="field-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select Department</option>
                {DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit}>{editId ? "Update Employee" : "Add Employee"}</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Modal title="Delete Employee" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 14, color: "#374151" }}>Are you sure you want to remove this employee? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 mt-5">
            <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
            <button onClick={() => handleDelete(deleteId)} style={{ background: "#dc2626", color: "white", padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none" }}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-full max-w-xl" style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Global field-input style via inline
const style = document.createElement("style");
style.textContent = `.field-input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #d1d5db; font-size: 13px; color: #374151; background: white; }`;
document.head.appendChild(style);
