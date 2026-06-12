import { useState } from "react";

export default function Header({ currentUser, onSwitchUser, users }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const otherUser = users.find((u) => u.id !== currentUser?.id);

  const handleSyncClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border-color)",
        padding: isAdmin ? "12px 32px" : "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--bg-header)",
        height: "64px",
        flexShrink: 0
      }}
    >
      {/* LEFT SIDE: Search Bar for Admin, Logo for Staff/Others */}
      {isAdmin ? (
        <div style={{ display: "flex", alignItems: "center", width: "380px", position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", color: "var(--text-tertiary)", display: "flex" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input
            type="text"
            placeholder="Search shipments, orders, or staff..."
            style={{
              paddingLeft: "36px",
              paddingRight: "12px",
              paddingTop: "7px",
              paddingBottom: "7px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              fontSize: "13px",
              width: "100%",
              outline: "none",
              color: "var(--text-primary)"
            }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "4px",
              backgroundColor: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="12" r="3" />
              <path d="M9 12h6" />
              <path d="M3 12h1m16 0h1M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "700", color: "#000000" }}>
              DPortal <span style={{ color: "var(--text-secondary)", fontWeight: "500", fontSize: "12px" }}>Ops</span>
            </h2>
          </div>
        </div>
      )}

      {/* RIGHT SIDE: Action icons & Profile element */}
      {currentUser && (
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          
          {/* Action Icons (only for Rohan/Admin) */}
          {isAdmin && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Sync icon */}
              <button
                onClick={handleSyncClick}
                title="Sync Dashboard Data"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "var(--transition)",
                  transform: isSyncing ? "rotate(180deg)" : "rotate(0deg)"
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "transform 0.4s ease" }}
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>

              {/* Notification icon */}
              <button
                title="Notifications"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  display: "flex",
                  padding: "4px",
                  position: "relative"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                {/* Notification Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    width: "7px",
                    height: "7px",
                    backgroundColor: "#ef4444",
                    borderRadius: "50%",
                    border: "1.5px solid white"
                  }}
                ></span>
              </button>
            </div>
          )}

          {/* Profile Dropdown Chip */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition)"
              }}
            >
              {isAdmin ? (
                <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", lineHeight: "1.2" }}>{currentUser.name}</span>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "600", marginTop: "1px" }}>Ops Manager</span>
                </div>
              ) : (
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{currentUser.name}</span>
              )}
              
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: currentUser.avatarColor || "var(--color-primary)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}
              >
                {currentUser.name[0]}
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}
                  onClick={() => setShowProfileMenu(false)}
                />
                <div
                  className="card"
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "38px",
                    width: "200px",
                    zIndex: 110,
                    padding: "6px",
                    boxShadow: "var(--shadow-lg)",
                    backgroundColor: "var(--bg-header)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    animation: "viewFadeIn 0.15s ease"
                  }}
                >
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)", marginBottom: "4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: "500" }}>Account Status</span>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text-primary)" }}>{currentUser.name}</div>
                    <span className={`badge ${isAdmin ? 'badge-delayed' : 'badge-processing'}`} style={{ fontSize: "9px", padding: "1px 4px", marginTop: "4px" }}>
                      {currentUser.role === "admin" ? "Admin / Manager" : "Operations"}
                    </span>
                  </div>

                  {otherUser && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSwitchUser(otherUser.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        border: "none",
                        fontSize: "12px",
                        padding: "8px 12px",
                        color: "var(--color-accent)",
                        fontWeight: "600"
                      }}
                    >
                      🔁 Switch to {otherUser.name}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSwitchUser(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      border: "none",
                      fontSize: "12px",
                      padding: "8px 12px",
                      color: "#b91c1c",
                      fontWeight: "600"
                    }}
                  >
                    🚪 Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
