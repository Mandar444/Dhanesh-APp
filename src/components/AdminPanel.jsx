import { useState } from "react";

export default function AdminPanel({
  users,
  frames,
  lensTypes,
  lensColors,
  onAddFrame,
  onDeleteFrame,
  onAddLensType,
  onAddLensColor,
  onAddUser
}) {
  const [activeTab, setActiveTab] = useState("frames");

  const [newFrame, setNewFrame] = useState({ name: "", colors: "" });
  const [newLensType, setNewLensType] = useState("");
  const [newLensColor, setNewLensColor] = useState("");
  const [newUser, setNewUser] = useState({ name: "", role: "staff", avatarColor: "#6366f1" });

  const handleFrameSubmit = (e) => {
    e.preventDefault();
    if (!newFrame.name || !newFrame.colors) return;
    const colorArray = newFrame.colors.split(",").map((c) => c.trim()).filter(Boolean);
    const frameData = {
      id: "frame_" + (frames.length + 1),
      name: newFrame.name,
      colors: colorArray
    };
    onAddFrame(frameData);
    setNewFrame({ name: "", colors: "" });
    alert("Eyewear frame added to catalog!");
  };

  const handleLensTypeSubmit = (e) => {
    e.preventDefault();
    if (!newLensType) return;
    onAddLensType(newLensType);
    setNewLensType("");
    alert("Lens type configuration saved!");
  };

  const handleLensColorSubmit = (e) => {
    e.preventDefault();
    if (!newLensColor) return;
    onAddLensColor(newLensColor);
    setNewLensColor("");
    alert("Lens tint configuration saved!");
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name) return;
    const userData = {
      id: newUser.name.toLowerCase().replace(/\s+/g, ""),
      name: newUser.name,
      role: newUser.role,
      avatarColor: newUser.avatarColor
    };
    onAddUser(userData);
    setNewUser({ name: "", role: "staff", avatarColor: "#6366f1" });
    alert("User profile created!");
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "800" }}>Admin Configuration</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Manage frames inventory catalogs, lens materials, and operations staff authorization.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("frames")}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === "frames" ? "var(--color-primary)" : "var(--bg-input)",
            color: activeTab === "frames" ? "white" : "var(--text-primary)"
          }}
        >
          👓 Eyewear Catalog
        </button>
        <button
          onClick={() => setActiveTab("lenses")}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === "lenses" ? "var(--color-primary)" : "var(--bg-input)",
            color: activeTab === "lenses" ? "white" : "var(--text-primary)"
          }}
        >
          🔍 Lenses Configuration
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className="btn btn-sm"
          style={{
            backgroundColor: activeTab === "users" ? "var(--color-primary)" : "var(--bg-input)",
            color: activeTab === "users" ? "white" : "var(--text-primary)"
          }}
        >
          👥 User Accounts
        </button>
      </div>

      {activeTab === "frames" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }} className="admin-grid">
          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Configured Frame Styles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
              {frames.map((frame) => (
                <div key={frame.id} className="card" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                  <button
                    onClick={() => {
                      if (confirm(`Delete frame "${frame.name}"?`)) onDeleteFrame(frame.id);
                    }}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer", fontWeight: "bold" }}
                  >
                    ✕
                  </button>
                  <h4 style={{ fontSize: "13px", fontWeight: "700" }}>{frame.name}</h4>
                  <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Colors: {frame.colors.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Add New Frame Style</h3>
            <form onSubmit={handleFrameSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label htmlFor="new-frm-name">Frame Model Name</label>
                <input type="text" id="new-frm-name" value={newFrame.name} onChange={(e) => setNewFrame({ ...newFrame, name: e.target.value })} required placeholder="e.g. Aviator Carbon" />
              </div>
              <div>
                <label htmlFor="new-frm-colors">Colors (Comma Separated)</label>
                <input type="text" id="new-frm-colors" value={newFrame.colors} onChange={(e) => setNewFrame({ ...newFrame, colors: e.target.value })} required placeholder="Gold, Black, Silver" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "6px" }}>Add Frame</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "lenses" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Lens Types</h3>
            <form onSubmit={handleLensTypeSubmit} style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              <input type="text" value={newLensType} onChange={(e) => setNewLensType(e.target.value)} required placeholder="e.g. High Index 1.67" />
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {lensTypes.map((t, i) => <div key={i} style={{ padding: "8px 12px", background: "var(--bg-input)", borderRadius: "4px", fontSize: "13px" }}>{i+1}. {t}</div>)}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Lens Coatings/Tints</h3>
            <form onSubmit={handleLensColorSubmit} style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              <input type="text" value={newLensColor} onChange={(e) => setNewLensColor(e.target.value)} required placeholder="e.g. polarized Amber" />
              <button type="submit" className="btn btn-primary btn-sm">Add</button>
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {lensColors.map((c, i) => <div key={i} style={{ padding: "8px 12px", background: "var(--bg-input)", borderRadius: "4px", fontSize: "13px" }}>{i+1}. {c}</div>)}
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Authorized Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: u.avatarColor, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "11px" }}>{u.name[0]}</div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{u.id}</td>
                    <td style={{ fontWeight: "600" }}>{u.name}</td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Create User Profile</h3>
            <form onSubmit={handleUserSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label htmlFor="usr-name-val">Display Name</label>
                <input type="text" id="usr-name-val" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required placeholder="e.g. John Doe" />
              </div>
              <div>
                <label htmlFor="usr-role-val">Role</label>
                <select id="usr-role-val" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="staff">Operations Staff (Packing)</option>
                  <option value="manager">Manager (Approve & Monitor)</option>
                  <option value="admin">Administrator (Master Data)</option>
                </select>
              </div>
              <div>
                <label htmlFor="usr-color-val">Avatar Accent Color</label>
                <select id="usr-color-val" value={newUser.avatarColor} onChange={(e) => setNewUser({ ...newUser, avatarColor: e.target.value })}>
                  <option value="#6366f1">Indigo</option>
                  <option value="#3b82f6">Blue</option>
                  <option value="#10b981">Green</option>
                  <option value="#f59e0b">Orange</option>
                  <option value="#ec4899">Pink</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: "6px" }}>Create User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
