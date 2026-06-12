import { useState } from "react";

export default function ManagerDashboard({
  orders,
  users,
  onSelectOrder,
  onOpenCreate,
  onWhatsAppNotify
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const totalCount = orders.length;
  const activeCount = orders.filter((o) => o.status === "Waiting" || o.status === "Packing").length;
  const blockedCount = orders.filter((o) => o.status === "Blocked").length;
  const packedCount = orders.filter((o) => o.status === "Packed").length;
  const dispatchedCount = orders.filter((o) => o.status === "Dispatched").length;

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === "active") return o.status === "Waiting" || o.status === "Packing";
    if (filter === "blocked") return o.status === "Blocked";
    if (filter === "packed") return o.status === "Packed";
    if (filter === "dispatched") return o.status === "Dispatched";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Title & Create trigger */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>Warehouse Shipments</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>Create and assign eyewear orders, check packing checklist logs, and verify dispatches.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenCreate} style={{ backgroundColor: "#000000", border: "none" }}>
          ＋ Create New Order
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
        
        {/* Total */}
        <div
          className="card"
          onClick={() => setFilter("all")}
          style={{
            padding: "16px 20px",
            cursor: "pointer",
            borderBottom: filter === "all" ? "3px solid #0f172a" : "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Shipments</span>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a" }}>{totalCount}</span>
        </div>

        {/* Active */}
        <div
          className="card"
          onClick={() => setFilter("active")}
          style={{
            padding: "16px 20px",
            cursor: "pointer",
            borderBottom: filter === "active" ? "3px solid var(--color-accent)" : "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Processing</span>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-accent)" }}>{activeCount}</span>
        </div>

        {/* Blocked */}
        <div
          className="card"
          onClick={() => setFilter("blocked")}
          style={{
            padding: "16px 20px",
            cursor: "pointer",
            borderBottom: filter === "blocked" ? "3px solid var(--color-danger)" : "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Blocked</span>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-danger)" }}>{blockedCount}</span>
        </div>

        {/* Packed */}
        <div
          className="card"
          onClick={() => setFilter("packed")}
          style={{
            padding: "16px 20px",
            cursor: "pointer",
            borderBottom: filter === "packed" ? "3px solid var(--color-success)" : "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Ready to Review</span>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--color-success)" }}>{packedCount}</span>
        </div>

        {/* Dispatched */}
        <div
          className="card"
          onClick={() => setFilter("dispatched")}
          style={{
            padding: "16px 20px",
            cursor: "pointer",
            borderBottom: filter === "dispatched" ? "3px solid #64748b" : "1px solid var(--border-color)",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "2px"
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Dispatched</span>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#64748b" }}>{dispatchedCount}</span>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        
        {/* Table Filters Toolbar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border-color)",
            gap: "10px",
            backgroundColor: "#ffffff"
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Processing" },
              { key: "blocked", label: "Blocked" },
              { key: "packed", label: "Packed" },
              { key: "dispatched", label: "Dispatched" }
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className="btn btn-sm"
                style={{
                  backgroundColor: filter === t.key ? "#0f172a" : "#ffffff",
                  color: filter === t.key ? "#ffffff" : "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "4px"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", width: "240px" }}>
            <input
              type="text"
              placeholder="Search customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                borderRadius: "4px",
                border: "1px solid #cbd5e1"
              }}
            />
          </div>
        </div>

        {/* Shipments Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Frame Details</th>
                <th>Lens Details</th>
                <th>Assigned Staff</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)", fontWeight: "500" }}>
                    No shipments found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const assignee = users.find((u) => u.id === order.assignedTo);
                  
                  // Map statuses to dynamic badges
                  const getStatusPill = (status) => {
                    switch (status) {
                      case "Waiting":
                        return <span className="badge badge-pickup">Pickup</span>;
                      case "Packing":
                        return <span className="badge badge-processing">Processing</span>;
                      case "Blocked":
                        return <span className="badge badge-critical">Blocked</span>;
                      case "Packed":
                        return <span className="badge badge-processing" style={{ backgroundColor: "#e6fffa", color: "#00b5ad" }}>Packed</span>;
                      case "Dispatched":
                        return <span className="badge badge-processing" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>Dispatched</span>;
                      default:
                        return <span className="badge">{status}</span>;
                    }
                  };

                  return (
                    <tr key={order.id} className="table-row-hover">
                      <td style={{ fontWeight: "700", color: "#0f172a" }}>{order.id}</td>
                      <td style={{ fontWeight: "600", color: "#334155" }}>{order.customerName}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <div style={{ fontWeight: "600", fontSize: "12px", color: "#334155" }}>{order.frameName}</div>
                          <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Color: {order.frameColor}</div>
                        </div>
                      </td>
                      <td style={{ fontSize: "12px" }}>
                        <div style={{ color: "#334155", fontWeight: "500" }}>{order.lensType}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "10px" }}>{order.lensColor}</div>
                      </td>
                      <td>
                        {assignee ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: assignee.avatarColor,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "8px",
                                fontWeight: "700"
                              }}
                            >
                              {assignee.name[0]}
                            </div>
                            <span style={{ fontWeight: "500", color: "#475569" }}>{assignee.name}</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-tertiary)", fontSize: "11px", fontWeight: "600" }}>Unassigned</span>
                        )}
                      </td>
                      <td>{getStatusPill(order.status)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => onSelectOrder(order.id)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            borderColor: order.status === "Packed" ? "var(--color-success)" : order.status === "Blocked" ? "var(--color-danger)" : "#cbd5e1",
                            color: order.status === "Packed" ? "var(--color-success)" : order.status === "Blocked" ? "var(--color-danger)" : "#0f172a",
                            fontWeight: "700",
                            borderRadius: "4px"
                          }}
                        >
                          {order.status === "Packed" && "Verify & Dispatch"}
                          {order.status === "Blocked" && "Clear Block"}
                          {order.status !== "Packed" && order.status !== "Blocked" && "Audit Log"}
                        </button>
                        {order.assignedTo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onWhatsAppNotify(order);
                            }}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#25D366",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              marginLeft: "6px",
                              padding: "6px 8px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              verticalAlign: "middle"
                            }}
                            title="Send WhatsApp Alert to Staff"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.588 1.977 14.131.952 11.518.951c-5.44.001-9.866 4.372-9.87 9.802 0 1.714.453 3.39 1.31 4.887L1.925 21.87l6.326-1.657zM16.73 14.85c-.284-.141-1.677-.827-1.936-.921-.258-.094-.446-.141-.634.141-.188.281-.727.921-.89 1.108-.163.188-.327.21-.611.07-1.184-.593-1.962-.977-2.742-2.312-.204-.349.204-.324.582-1.082.063-.125.031-.234-.016-.328-.047-.094-.446-1.077-.611-1.477-.161-.389-.327-.336-.446-.336-.115-.002-.248-.002-.38-.002-.133 0-.349.05-.533.25-.184.2-.703.687-.703 1.67 0 .983.715 1.933.815 2.067.1.134 1.407 2.146 3.409 3.012.476.206.848.33 1.139.422.479.152.915.13 1.259.08.384-.055 1.677-.687 1.914-1.35.238-.663.238-1.233.167-1.35-.07-.116-.254-.187-.539-.327z"/></svg>
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

      </div>
    </div>
  );
}
