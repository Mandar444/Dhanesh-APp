export default function LogisticsDashboard({ orders, users, onSelectOrder }) {
  // Status mapping matching table tags in screenshot
  const getStatusBadge = (status, assignedTo) => {
    if (status === "Packing") {
      return <span className="badge badge-processing">Processing</span>;
    }
    if (status === "Blocked") {
      return assignedTo ? (
        <span className="badge badge-delayed">Delayed</span>
      ) : (
        <span className="badge badge-critical">Critical</span>
      );
    }
    if (status === "Waiting") {
      return <span className="badge badge-pickup">Pickup</span>;
    }
    if (status === "Packed") {
      return <span className="badge badge-processing" style={{ backgroundColor: "#e6fffa", color: "#00b5ad" }}>Packed</span>;
    }
    return <span className="badge badge-processing" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{status}</span>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "viewFadeIn 0.25s ease-out" }}>
      
      {/* Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Internal Warehouse Operations</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "2px" }}>
            Live monitoring for Terminal A-12 • Last updated: Just now
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Report
          </button>
          <button className="btn btn-primary" style={{ backgroundColor: "#000000", border: "none" }} onClick={() => window.location.reload()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Live Orders Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-header)" }}>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>Live Orders</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Showing {orders.length} active shipments</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", display: "flex" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Status</th>
                <th>Destination</th>
                <th>Assigned Staff</th>
                <th>ETA</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)", fontWeight: "500" }}>
                    No active orders. Create or assign eyewear shipments to display them here.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const assignee = users.find((u) => u.id === o.assignedTo);
                  
                  return (
                    <tr key={o.id} className="table-row-hover">
                      <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>{o.id}</td>
                      <td>{getStatusBadge(o.status, o.assignedTo)}</td>
                      <td style={{ fontWeight: "600", color: "var(--text-secondary)" }}>{o.destination || "Storage Zone A-12"}</td>
                      <td>
                        {assignee ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: assignee.avatarColor,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: "700"
                              }}
                            >
                              {assignee.name[0]}
                            </div>
                            <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{assignee.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-danger)", fontWeight: "700", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--color-danger)" }}></span>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: "600", color: "var(--text-secondary)" }}>{o.eta || "ASAP"}</td>
                      <td style={{ textAlign: "right" }}>
                        {!o.assignedTo ? (
                          <button
                            onClick={() => onSelectOrder(o.id)}
                            className="btn btn-primary btn-sm"
                            style={{ backgroundColor: "#000000", border: "none", fontSize: "11px", fontWeight: "800", color: "white", borderRadius: "4px" }}
                          >
                            ASSIGN
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectOrder(o.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", outline: "none", display: "inline-flex" }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px", display: "flex", justifyContent: "center", borderTop: "1px solid var(--border-color)", backgroundColor: "var(--bg-header)" }}>
          <button className="btn btn-secondary btn-sm" style={{ fontWeight: "700", border: "1px solid var(--border-color)" }}>
            LOAD MORE SHIPMENTS
          </button>
        </div>
      </div>
    </div>
  );
}
