import { useState } from "react";

export default function PackingScreen({ order, onBack, onUpdateChecklist, onMarkPacked, onReportIssue }) {
  const [checklist, setChecklist] = useState({ ...order.checklist });

  const isHandover = order.specialInstructions?.includes("MODE: Handover");
  const displayInstructions = order.specialInstructions
    ? order.specialInstructions.replace(" | MODE: Handover", "").replace("MODE: Handover", "").trim()
    : "";

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState("Frame Not Available");
  const [issueDetails, setIssueDetails] = useState("");

  const handleCheck = (key) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    onUpdateChecklist(order.id, updated);
  };

  const isChecklistComplete = Object.values(checklist).every(Boolean);
  const canPack = isChecklistComplete;

  const handlePackSubmit = () => {
    if (!canPack) return;
    onMarkPacked(order.id, []);
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    onReportIssue(order.id, issueType, issueDetails, null);
    setShowIssueModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "viewFadeIn 0.3s ease-out" }}>
      
      {/* Header Bar */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px"
        }}
      >
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Tasks
        </button>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Guided Packing Assistant</h2>
          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>Order ID: {order.id}</span>
        </div>
        <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      {/* 2-Column Split Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", alignItems: "flex-start" }}>
        
        {/* LEFT COLUMN: SPECS & PRESCRIPTION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Eyewear Spec Card */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Eyewear Specs</h3>
            
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>{order.frameName}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                  Color: {order.frameColor}
                </span>
                <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#475569" }}>
                  Lens: {order.lensColor}
                </span>
              </div>
            </div>
          </div>

          {/* Rx Prescription Details */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Customer & Lens Formula</h3>
            
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>{order.customerName}</div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Lens Type: <strong>{order.lensType}</strong></p>
            </div>

            {order.prescription && order.prescription.hasPrescription ? (
              <div className="rx-card" style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Prescription Details:</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#2563eb" }}>
                  {order.prescription.prescriptionType || order.prescription.type || "Single Vision"} Lens
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "13px", padding: "12px", background: "#f8fafc", borderRadius: "8px", color: "var(--text-secondary)", fontStyle: "italic", border: "1px solid var(--border-color)", textAlign: "center" }}>
                No prescription values required (Plano lenses).
              </div>
            )}

            {displayInstructions && (
              <div style={{ marginTop: "4px", padding: "12px 14px", backgroundColor: "#fffbeb", borderLeft: "4px solid var(--color-warning)", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#b45309" }}>⚠️ Special Packing Notes:</div>
                <p style={{ fontSize: "13px", color: "#b45309", marginTop: "2px", fontWeight: "600" }}>{displayInstructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHECKLIST & PROOFS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Packing Checklist */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Guided Packing steps</h3>
            
            <div className="checklist-container" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              {/* Step 1 */}
              <div className={`checklist-item ${checklist.confirmFrame ? "checked" : ""}`} onClick={() => handleCheck("confirmFrame")}>
                <div className="checklist-checkbox">
                  {checklist.confirmFrame && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">1. Verify Frame Style & Color</span>
                  <span className="checklist-desc">Frame sticker matches "{order.frameName}" and color matches "{order.frameColor}"</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`checklist-item ${checklist.verifyLens ? "checked" : ""}`} onClick={() => handleCheck("verifyLens")}>
                <div className="checklist-checkbox">
                  {checklist.verifyLens && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">2. Verify Lens Tint & Coating</span>
                  <span className="checklist-desc">Lens coating and specifications match order: "{order.lensColor}"</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`checklist-item ${checklist.addCase ? "checked" : ""}`} onClick={() => handleCheck("addCase")}>
                <div className="checklist-checkbox">
                  {checklist.addCase && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">3. Add Protective Case</span>
                  <span className="checklist-desc">Wipe down glasses and secure them inside the protective case</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`checklist-item ${checklist.addCloth ? "checked" : ""}`} onClick={() => handleCheck("addCloth")}>
                <div className="checklist-checkbox">
                  {checklist.addCloth && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">4. Add Microfiber Cleaning Cloth</span>
                  <span className="checklist-desc">Fold one cleaning cloth and tuck it beside the eyewear</span>
                </div>
              </div>

              {/* Step 5 */}
              <div className={`checklist-item ${checklist.includeInvoice ? "checked" : ""}`} onClick={() => handleCheck("includeInvoice")}>
                <div className="checklist-checkbox">
                  {checklist.includeInvoice && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">5. Include Printed Order Invoice</span>
                  <span className="checklist-desc">Verify printed copy belongs to customer "{order.customerName}"</span>
                </div>
              </div>

              {/* Step 6 */}
              <div className={`checklist-item ${checklist.preparePackage ? "checked" : ""}`} onClick={() => handleCheck("preparePackage")}>
                <div className="checklist-checkbox">
                  {checklist.preparePackage && (
                    <svg width="10" height="8" viewBox="0 0 12 9" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4.5 4 7.5 11 1"></polyline></svg>
                  )}
                </div>
                <div className="checklist-text">
                  <span className="checklist-title">
                    {isHandover ? "6. Direct Handover Preparation" : "6. Package & Apply Label"}
                  </span>
                  <span className="checklist-desc">
                    {isHandover
                      ? "Verify pieces are clean and ready for direct customer/courier handoff (no shipping box or label required)"
                      : `Seal inside shipping box and attach the label for "${order.customerName}"`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Packing Actions */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Packing Actions</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "-4px" }}>Ensure all checklist items above are checked to mark the order as packed.</p>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setShowIssueModal(true)} className="btn btn-secondary" style={{ flex: 1, color: "var(--color-danger)", borderColor: "rgba(239, 68, 68, 0.2)" }}>
                ⚠️ Blockage
              </button>
              <button
                onClick={handlePackSubmit}
                disabled={!canPack}
                className="btn btn-primary"
                style={{
                  flex: 2,
                  backgroundColor: canPack ? "var(--color-success)" : "rgba(15,23,42,0.06)",
                  borderColor: canPack ? "var(--color-success)" : "transparent",
                  color: canPack ? "white" : "var(--text-tertiary)"
                }}
              >
                Mark Packed & Complete
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Blockage Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="modal-header">
              <h3 style={{ fontSize: "16px", color: "var(--color-danger)", display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" }}>
                ⚠️ Report Packing Blockage
              </h3>
              <button onClick={() => setShowIssueModal(false)} style={{ background: "none", border: "none", fontSize: "20px", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleIssueSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label htmlFor="issue-category-sel">Blockage Category</label>
                  <select
                    id="issue-category-sel"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option value="Frame Not Available">Frame Not Available</option>
                    <option value="Wrong Colour Received">Wrong Colour Received</option>
                    <option value="Lens Not Ready">Lens Not Ready</option>
                    <option value="Damaged Product">Damaged Product</option>
                    <option value="Prescription Issue">Prescription Issue</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="issue-details-input">Problem Details *</label>
                  <textarea
                    id="issue-details-input"
                    rows="3"
                    placeholder="Describe what occurred (e.g. Scratched lens, mismatching tint...)"
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    required
                  ></textarea>
                </div>


              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: "var(--color-danger)", border: "none" }}>Submit Blockage Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
