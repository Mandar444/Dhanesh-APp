import { useState } from "react";

export default function LoginScreen({ users, onSelectUser }) {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUserClick = (user) => {
    setError("");
    setPassword("");
    if (user.id === "rohan") {
      setSelectedUser(user);
      setShowPasswordPrompt(true);
    } else {
      onSelectUser(user.id);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin";
    if (password === adminPassword) {
      onSelectUser(selectedUser.id);
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleBack = () => {
    setShowPasswordPrompt(false);
    setSelectedUser(null);
    setPassword("");
    setError("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "16px",
        position: "relative",
        width: "100%"
      }}
    >
      {/* Mesh Background Blobs */}
      <div className="mesh-container">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>

      {showPasswordPrompt ? (
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "380px",
            padding: "40px 32px",
            textAlign: "center",
            borderRadius: "var(--radius-lg)"
          }}
        >
          {/* Back button */}
          <button
            onClick={handleBack}
            className="btn btn-secondary btn-sm"
            style={{
              border: "none",
              background: "rgba(0,0,0,0.05)",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              marginBottom: "16px",
              fontWeight: "700"
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back
          </button>

          {/* Large user avatar */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: selectedUser.avatarColor,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "32px",
              margin: "0 auto 16px auto",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              border: "3px solid white"
            }}
          >
            {selectedUser.name[0]}
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>Sign In as {selectedUser.name}</h2>
          <span
            className="badge"
            style={{
              backgroundColor: "#fffbeb",
              color: "#d97706",
              marginTop: "6px",
              marginBottom: "24px",
              fontSize: "10px"
            }}
          >
            {selectedUser.role}
          </span>

          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "left" }}>
              <label htmlFor="admin-pwd-inp" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Enter Password</label>
              <input
                type="password"
                id="admin-pwd-inp"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1"
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "8px 12px",
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "var(--color-danger)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "1px solid rgba(239,68,68,0.15)"
                }}
              >
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "11px", borderRadius: "8px", marginTop: "8px", backgroundColor: "#000000", border: "none" }}>
              Unlock Supervisor Dashboard
            </button>
          </form>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "44px 32px",
            textAlign: "center",
            borderRadius: "var(--radius-lg)"
          }}
        >
          {/* Logo element */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              backgroundColor: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              margin: "0 auto 20px auto",
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="12" r="3" />
              <path d="M9 12h6" />
              <path d="M3 12h1m16 0h1M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3" />
            </svg>
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>DPortal Operations</h1>
          <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "4px", marginBottom: "32px" }}>
            Select your profile to unlock your workspace.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  width: "100%",
                  padding: "14px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid var(--border-color)",
                  background: "rgba(255, 255, 255, 0.6)",
                  transition: "var(--transition)",
                  borderRadius: "10px",
                  outline: "none"
                }}
                className="table-row-hover"
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: user.avatarColor || "var(--color-accent)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    flexShrink: 0
                  }}
                >
                  {user.name[0]}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                    <span
                      className="badge"
                      style={{
                        fontSize: "8px",
                        padding: "1px 4px",
                        backgroundColor: user.role === "admin" ? "#fffbeb" : "#e6fffa",
                        color: user.role === "admin" ? "#d97706" : "#00b5ad"
                      }}
                    >
                      {user.role}
                    </span>
                    <span>
                      {user.role === "staff" ? "Direct Login" : "Requires Password"}
                    </span>
                  </div>
                </div>

                <div style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
