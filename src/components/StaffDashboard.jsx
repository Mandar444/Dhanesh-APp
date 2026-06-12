import { useState } from "react";

export default function StaffDashboard({ orders, currentUser, onSelectOrder }) {
  const [filter, setFilter] = useState("pending");

  const myOrders = orders.filter((o) => o.assignedTo === currentUser.id);

  const pendingCount = myOrders.filter((o) => o.status === "Waiting" || o.status === "Packing").length;
  const blockedCount = myOrders.filter((o) => o.status === "Blocked").length;
  const completedCount = myOrders.filter((o) => o.status === "Packed" || o.status === "Dispatched").length;

  const filteredOrders = myOrders.filter((o) => {
    if (filter === "pending") return o.status === "Waiting" || o.status === "Packing";
    if (filter === "blocked") return o.status === "Blocked";
    if (filter === "completed") return o.status === "Packed" || o.status === "Dispatched";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner Widget */}
      <div
        className="card-glass"
        style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, #4338ca 100%)",
          color: "white",
          padding: "28px",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div>
          <span style={{ fontSize: "14px", opacity: 0.9, fontWeight: "500" }}>Logged in as Operations Staff</span>
          <h1 style={{ color: "white", fontSize: "28px", marginTop: "2px", fontWeight: "800" }}>Hello, {currentUser.name}</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "4px" }}>Manage your assigned packaging tasks and report inventory blockages.</p>
        </div>
        
        {/* Simple Widget Counters */}
        <div style={{ display: "flex", gap: "12px", minWidth: "280px" }}>
          <div style={{ flex: 1, background: "rgba(255, 255, 255, 0.15)", padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "800" }}>{pendingCount}</div>
            <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: "600" }}>To Pack</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255, 255, 255, 0.15)", padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "800" }}>{completedCount}</div>
            <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: "600" }}>Packed</div>
          </div>
          {blockedCount > 0 && (
            <div style={{ flex: 1, background: "rgba(239, 68, 68, 0.3)", padding: "12px 16px", borderRadius: "var(--radius-md)", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "800" }}>{blockedCount}</div>
              <div style={{ fontSize: "12px", opacity: 0.9, fontWeight: "600" }}>Blocked</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Section */}
      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Filter Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800" }}>Assigned Orders</h3>
          
          <div style={{ display: "flex", background: "var(--bg-input)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", width: "100%", maxWidth: "400px" }}>
            <button
              onClick={() => setFilter("pending")}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                background: filter === "pending" ? "var(--color-primary)" : "transparent",
                color: filter === "pending" ? "white" : "var(--text-secondary)",
                fontWeight: "700",
                fontSize: "13px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              Active Tasks ({pendingCount})
            </button>
            <button
              onClick={() => setFilter("blocked")}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                background: filter === "blocked" ? "var(--color-danger)" : "transparent",
                color: filter === "blocked" ? "white" : "var(--text-secondary)",
                fontWeight: "700",
                fontSize: "13px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              Blocked ({blockedCount})
            </button>
            <button
              onClick={() => setFilter("completed")}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "none",
                background: filter === "completed" ? "var(--color-success)" : "transparent",
                color: filter === "completed" ? "white" : "var(--text-secondary)",
                fontWeight: "700",
                fontSize: "13px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Task Cards Grid (Responsive 2-3 Columns) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredOrders.length === 0 ? (
            <div
              className="card"
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
                borderStyle: "dashed"
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</span>
              <h3 style={{ fontSize: "16px", marginBottom: "4px" }}>No orders in this list</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>All caught up! Any new assignments will show up here.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order.id)}
                className="card animate-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  padding: "20px",
                  border: "1px solid var(--border-color)",
                  position: "relative",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", gap: "16px" }}>
                  {/* Text Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-tertiary)" }}>{order.id}</span>
                      <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                    <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-primary)" }}>{order.frameName}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Color: <strong style={{ color: "var(--text-primary)" }}>{order.frameColor}</strong>
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      Lens: {order.lensType} ({order.lensColor})
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "12px",
                    fontSize: "13px"
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>
                    For: <strong style={{ color: "var(--text-primary)" }}>{order.customerName}</strong>
                  </span>
                  
                  {order.status !== "Blocked" ? (
                    <span style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                      {Object.values(order.checklist).filter(Boolean).length}/6 Packed
                    </span>
                  ) : (
                    <span style={{ fontWeight: "700", color: "var(--color-danger)" }}>⚠️ Blocked</span>
                  )}
                </div>

                {/* Blocked notice overlay */}
                {order.status === "Blocked" && order.issue && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(239, 68, 68, 0.06)",
                      borderTop: "1px solid rgba(239, 68, 68, 0.15)",
                      padding: "6px 16px",
                      fontSize: "11px",
                      color: "var(--color-danger)",
                      fontWeight: "700",
                      borderBottomLeftRadius: "var(--radius-md)",
                      borderBottomRightRadius: "var(--radius-md)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    ⚠️ {order.issue.type}: {order.issue.details}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
