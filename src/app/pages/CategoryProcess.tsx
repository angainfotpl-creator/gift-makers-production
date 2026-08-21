import { useState } from "react";
import { useStore, Category, WorkflowStep } from "../store";

type Tab = "list" | "add" | "workflow";

export default function CategoryProcess() {
  const { categories, setCategories, employees } = useStore();
  const [tab, setTab] = useState<Tab>("list");
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [empIds, setEmpIds] = useState<string[]>([]);
  const [active, setActive] = useState(true);

  // Workflow
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [stepName, setStepName] = useState("");
  const [stepMin, setStepMin] = useState("");
  const [stepMax, setStepMax] = useState("");

  function openAdd() {
    setEditCat(null);
    setName(""); setCode(""); setDesc(""); setEmpIds([]); setActive(true);
    setTab("add");
  }

  function openEdit(c: Category) {
    setEditCat(c);
    setName(c.name); setCode(c.code); setDesc(c.description); setEmpIds(c.employeeIds); setActive(c.active);
    setTab("add");
  }

  function openWorkflow(c: Category) {
    setSelectedCat(c);
    setSteps([...c.workflow]);
    setTab("workflow");
  }

  function handleSaveCat() {
    if (!name.trim() || !code.trim()) return;
    if (editCat) {
      setCategories(categories.map((c) => c.id === editCat.id ? { ...editCat, name, code, description: desc, employeeIds: empIds, active } : c));
    } else {
      const newCat: Category = { id: `c${Date.now()}`, name, code, description: desc, employeeIds: empIds, workflow: [], active };
      setCategories([...categories, newCat]);
    }
    setTab("list");
  }

  function addStep() {
    if (!stepName.trim() || !stepMin || !stepMax) return;
    setSteps([...steps, { id: `ws${Date.now()}`, name: stepName, minTime: parseFloat(stepMin), maxTime: parseFloat(stepMax) }]);
    setStepName(""); setStepMin(""); setStepMax("");
  }

  function removeStep(id: string) { setSteps(steps.filter((s) => s.id !== id)); }

  function saveWorkflow() {
    if (!selectedCat) return;
    setCategories(categories.map((c) => c.id === selectedCat.id ? { ...c, workflow: steps } : c));
    setTab("list");
  }

  function deleteCategory(id: string) {
    setCategories(categories.filter((c) => c.id !== id));
  }

  function toggleEmp(id: string) {
    setEmpIds((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Categories & Process</h1>
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>Define print categories and map their production workflows</p>
        </div>
        {tab === "list" && <button className="btn-primary" onClick={openAdd}>+ New Category</button>}
        {tab !== "list" && (
          <button className="btn-secondary" onClick={() => setTab("list")}>← Back to Categories</button>
        )}
      </div>

      {/* Category List */}
      {tab === "list" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {categories.map((cat) => {
            const catEmps = employees.filter((e) => cat.employeeIds.includes(e.id));
            return (
              <div key={cat.id} className="rounded-xl p-5" style={{ background: "white", border: "1px solid #e5e7eb" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: "#eff6ff" }}>
                      <span style={{ fontSize: 20 }}>🖨️</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{cat.name}</h3>
                      <p style={{ fontSize: 12, color: "#9ca3af" }}>Code: {cat.code}</p>
                    </div>
                  </div>
                  <span className="badge" style={{ background: cat.active ? "#ecfdf5" : "#f3f4f6", color: cat.active ? "#059669" : "#6b7280" }}>
                    {cat.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, minHeight: 32 }}>{cat.description || "No description"}</p>

                {/* Employees */}
                <div className="mb-3">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Employees ({catEmps.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {catEmps.slice(0, 4).map((e) => (
                      <span key={e.id} style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>
                        {e.name.split(" ")[0]}
                      </span>
                    ))}
                    {catEmps.length > 4 && <span style={{ fontSize: 11, color: "#9ca3af" }}>+{catEmps.length - 4} more</span>}
                    {catEmps.length === 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>No employees assigned</span>}
                  </div>
                </div>

                {/* Workflow */}
                <div className="mb-4">
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                    Workflow ({cat.workflow.length} steps)
                  </p>
                  {cat.workflow.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      {cat.workflow.map((s, i) => (
                        <span key={s.id} className="flex items-center gap-1">
                          <span style={{ fontSize: 11, background: "#eff6ff", color: "#2563EB", padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{s.name}</span>
                          {i < cat.workflow.length - 1 && <span style={{ color: "#d1d5db", fontSize: 12 }}>→</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: "#9ca3af" }}>No workflow defined</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openWorkflow(cat)} className="flex-1" style={{ fontSize: 12, fontWeight: 500, color: "#2563EB", background: "#eff6ff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>
                    {cat.workflow.length > 0 ? "Edit Workflow" : "Define Workflow"}
                  </button>
                  <button onClick={() => openEdit(cat)} style={{ fontSize: 12, fontWeight: 500, color: "#374151", background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => deleteCategory(cat.id)} style={{ fontSize: 12, fontWeight: 500, color: "#dc2626", background: "#fef2f2", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer" }}>Del</button>
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-3 rounded-xl p-12 text-center" style={{ background: "white", border: "1px dashed #d1d5db" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🖨️</p>
              <p style={{ fontSize: 14, color: "#9ca3af" }}>No categories yet. Create your first print category.</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Category */}
      {tab === "add" && (
        <div className="rounded-xl p-6 max-w-2xl" style={{ background: "white", border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 20 }}>{editCat ? "Edit Category" : "New Print Category"}</h2>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Category Name *</label>
              <input className="field-input" placeholder="e.g. Laser Printing" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Category Code *</label>
              <input className="field-input" placeholder="e.g. LSR" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Description</label>
              <textarea placeholder="Brief description of this category..." value={desc} onChange={(e) => setDesc(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, resize: "vertical", minHeight: 72 }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Assign Employees</label>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer" style={{ border: `1px solid ${empIds.includes(emp.id) ? "#2563EB" : "#e5e7eb"}`, background: empIds.includes(emp.id) ? "#eff6ff" : "white" }}>
                    <input type="checkbox" checked={empIds.includes(emp.id)} onChange={() => toggleEmp(emp.id)} style={{ accentColor: "#2563EB" }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>{emp.name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af" }}>{emp.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Active Status</label>
              <button
                onClick={() => setActive(!active)}
                style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: active ? "#2563EB" : "#d1d5db", position: "relative", transition: "background 0.2s" }}
              >
                <span style={{ position: "absolute", top: 3, left: active ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
              <span style={{ fontSize: 12, color: active ? "#059669" : "#6b7280" }}>{active ? "Active" : "Inactive"}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setTab("list")}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveCat}>{editCat ? "Update Category" : "Create Category"}</button>
          </div>
        </div>
      )}

      {/* Workflow Editor */}
      {tab === "workflow" && selectedCat && (
        <div className="max-w-2xl">
          <div className="rounded-xl p-6 mb-4" style={{ background: "white", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Workflow for: {selectedCat.name}</h2>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Define the production steps and estimated time for each.</p>

            {/* Steps */}
            {steps.length > 0 && (
              <div className="mb-5">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 mb-2 rounded-lg px-4 py-3" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#2563EB", color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#111827" }}>{s.name}</span>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{s.minTime}h – {s.maxTime}h</span>
                    {i > 0 && (
                      <button onClick={() => setSteps(steps.map((st, idx) => idx === i ? steps[i - 1] : idx === i - 1 ? s : st))} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16 }}>↑</button>
                    )}
                    <button onClick={() => removeStep(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 18, fontWeight: 700 }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add step */}
            <div className="rounded-lg p-4" style={{ background: "#f9fafb", border: "1px dashed #d1d5db" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Add Step</p>
              <div className="flex gap-3 items-end">
                <div style={{ flex: 2 }}>
                  <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Step Name</label>
                  <input value={stepName} onChange={(e) => setStepName(e.target.value)} placeholder="e.g. Designing" style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Min (hrs)</label>
                  <input type="number" min="0" step="0.25" value={stepMin} onChange={(e) => setStepMin(e.target.value)} placeholder="0.5" style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#9ca3af", display: "block", marginBottom: 4 }}>Max (hrs)</label>
                  <input type="number" min="0" step="0.25" value={stepMax} onChange={(e) => setStepMax(e.target.value)} placeholder="2" style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
                </div>
                <button className="btn-primary" onClick={addStep} style={{ whiteSpace: "nowrap" }}>+ Add</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setTab("list")}>Cancel</button>
            <button className="btn-primary" onClick={saveWorkflow}>Save Workflow</button>
          </div>
        </div>
      )}
    </div>
  );
}
