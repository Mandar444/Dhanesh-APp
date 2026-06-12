import { useState, useEffect } from "react";
import Header from "./components/Header";
import LoginScreen from "./components/LoginScreen";
import StaffDashboard from "./components/StaffDashboard";
import PackingScreen from "./components/PackingScreen";
import ManagerDashboard from "./components/ManagerDashboard";
import AdminPanel from "./components/AdminPanel";
import LogisticsDashboard from "./components/LogisticsDashboard";
import {
  initDB,
  getUsers,
  getFrames,
  getLensTypes,
  getLensColors,
  getOrders,
  createOrder,
  updateOrderChecklist,
  markOrderPacked,
  reportOrderIssue,
  resolveOrderIssue,
  approveOrderDispatch,
  saveFrame,
  deleteFrame,
  saveLensType,
  saveLensColor,
  saveUser
} from "./utils/db";
import "./index.css";
const getValidLensConfig = (frame, color, currentCategory) => {
  if (!frame || !color) return { category: "Standard Lens", lens: "RX" };
  const lenses = frame.variants ? frame.variants.filter((v) => v.color === color).map((v) => v.lens) : [];
  const supportsStandard = lenses.includes("RX");
  const supportsCustom = lenses.some((l) => l !== "RX");

  let resolvedCategory = currentCategory;
  if (currentCategory === "Standard Lens" && !supportsStandard) {
    resolvedCategory = "Custom Lens";
  } else if (currentCategory === "Custom Lens" && !supportsCustom) {
    resolvedCategory = "Standard Lens";
  }

  let resolvedLens = "RX";
  if (resolvedCategory === "Custom Lens") {
    const customLenses = lenses.filter((l) => l !== "RX");
    resolvedLens = customLenses[0] || "Green";
  }

  return { category: resolvedCategory, lens: resolvedLens };
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [frames, setFrames] = useState([]);
  const [lensTypes, setLensTypes] = useState([]);
  const [lensColors, setLensColors] = useState([]);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // WhatsApp CallMeBot settings state
  const [whatsappSettings, setWhatsappSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("eyewear_whatsapp_settings")) || {};
    } catch {
      return {};
    }
  });

  const [localSettings, setLocalSettings] = useState({});

  const saveWhatsappSettings = (newSettings) => {
    setWhatsappSettings(newSettings);
    localStorage.setItem("eyewear_whatsapp_settings", JSON.stringify(newSettings));
  };

  const handleSettingsChange = (userId, field, value) => {
    setLocalSettings((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { phone: "", apikey: "", enabled: false }),
        [field]: value
      }
    }));
  };

  const handleSaveSettings = () => {
    saveWhatsappSettings(localSettings);
    triggerWhatsAppToast("System Alert", "WhatsApp configuration saved successfully!");
  };
  
  const triggerNativeNotification = (title, body) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        try {
          new Notification(title, {
            body: body,
            tag: "dportal-alert",
            renotify: true
          });
        } catch (e) {
          console.error("Failed to show native notification:", e);
        }
      }
    }
  };

  const triggerWhatsAppToast = (senderName, messageText) => {
    const id = Date.now();
    const newToast = { id, senderName, messageText };
    setToasts((prev) => [...prev, newToast]);
    
    // Trigger OS-level system push notification
    triggerNativeNotification(senderName, messageText);
    
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
      audio.volume = 0.4;
      audio.play();
    } catch {
      console.log("Audio play blocked");
    }
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const sendWhatsAppNotification = (order) => {
    return new Promise((resolve) => {
      const assignee = users.find((u) => u.id === order.assignedTo);
      const staffName = assignee ? assignee.name : "Staff";
      const userSettings = whatsappSettings[order.assignedTo];
      
      if (!userSettings || !userSettings.enabled || !userSettings.phone || !userSettings.apikey) {
        console.log(`WhatsApp config missing or disabled for assignee ${order.assignedTo}`);
        resolve(false);
        return;
      }
      
      const message = `Hello ${staffName}, a new eyewear order has been assigned to you:\n\n` +
        `*Order ID*: ${order.id}\n` +
        `*Customer*: ${order.customerName}\n` +
        `*Frame*: ${order.frameName} (${order.frameColor})\n` +
        `*Lens*: ${order.lensType} (${order.lensColor})\n\n` +
        `Please check the DPortal Operations floor to begin packing. Link: ${window.location.origin}`;
        
      const encodedText = encodeURIComponent(message);
      const cleanPhone = userSettings.phone.replace(/[^0-9]/g, "");
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&apikey=${userSettings.apikey}&text=${encodedText}`;
      
      const beacon = new Image();
      const onDone = () => {
        triggerWhatsAppToast("WhatsApp Sent", `Automated notification sent to ${staffName}!`);
        resolve(true);
      };
      beacon.onload = onDone;
      beacon.onerror = onDone;
      beacon.src = url;
    });
  };

  const handleTestNotification = (userId) => {
    const userSettings = localSettings[userId];
    if (!userSettings || !userSettings.phone || !userSettings.apikey) {
      alert("Please enter a phone number and API key to send a test message.");
      return;
    }
    
    const targetUser = users.find(u => u.id === userId);
    const userName = targetUser ? targetUser.name : userId;
    
    const message = `🔔 *DPortal Test Notification*\n\n` +
      `Hello ${userName}, this is a test notification from the DPortal logistics terminal.\n\n` +
      `Your automated notification channel is successfully configured!`;
      
    const encodedText = encodeURIComponent(message);
    const cleanPhone = userSettings.phone.replace(/[^0-9]/g, "");
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&apikey=${userSettings.apikey}&text=${encodedText}`;
    
    triggerWhatsAppToast("Testing...", `Sending test WhatsApp to ${userName}...`);
    const beacon = new Image();
    const onDone = () => {
      triggerWhatsAppToast("Test Sent", `Test WhatsApp sent to ${userName}!`);
    };
    beacon.onload = onDone;
    beacon.onerror = onDone;
    beacon.src = url;
  };

  const handleWhatsAppNotify = async (order) => {
    const sent = await sendWhatsAppNotification(order);
    if (!sent) {
      const assignee = users.find((u) => u.id === order.assignedTo);
      const staffName = assignee ? assignee.name : "Staff";
      
      const message = `Hello ${staffName}, a new eyewear order has been assigned to you:\n\n` +
        `*Order ID*: ${order.id}\n` +
        `*Customer*: ${order.customerName}\n` +
        `*Frame*: ${order.frameName} (${order.frameColor})\n` +
        `*Lens*: ${order.lensType} (${order.lensColor})\n\n` +
        `Please check the DPortal Operations floor to begin packing. Link: ${window.location.origin}`;
      
      const encodedText = encodeURIComponent(message);
      const defaultPhone = "+919999999999";
      const phoneNumber = prompt(`Enter WhatsApp phone number for ${staffName} (with country code):`, defaultPhone);
      
      if (phoneNumber) {
        const waUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedText}`;
        window.open(waUrl, "_blank");
        triggerWhatsAppToast("System Alert", `WhatsApp notification sent to ${staffName}!`);
      }
    }
  };
  
  // Navigation / Tab Routing
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, orders, inventory, staff
  const [activeOrderId, setActiveOrderId] = useState(null); // Used for staff packing or manager audit details
  
  // Modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Used to show detail/review modal for Rohan
  


  // Create Order Form state
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    frameId: "",
    frameColor: "",
    lensCategory: "Standard Lens",
    lensColor: "RX",
    specialInstructions: "",
    assignedTo: "",
    hasPrescription: false,
    prescriptionType: "Single Vision",
    deliveryMode: "Shipment"
  });

  // Resolution Form state
  const [resolutionNote, setResolutionNote] = useState("");
  const [reassignUserId, setReassignUserId] = useState("");

  const refreshState = async () => {
    const loadedUsers = await getUsers();
    const loadedOrders = await getOrders();
    const loadedFrames = await getFrames();
    const loadedLensTypes = await getLensTypes();
    const loadedLensColors = await getLensColors();

    setUsers(loadedUsers);
    setOrders(loadedOrders);
    setFrames(loadedFrames);
    setLensTypes(loadedLensTypes);
    setLensColors(loadedLensColors);

    // Sync selected order if open
    const orderId = localStorage.getItem("active_review_order_id");
    if (orderId) {
      const matched = loadedOrders.find((o) => o.id === orderId);
      if (matched) setSelectedOrder(matched);
    }

    const storedUser = localStorage.getItem("eyewear_current_user_id");
    if (storedUser) {
      const matched = loadedUsers.find((u) => u.id === storedUser);
      if (matched) {
        setCurrentUser(matched);
      }
    }
  };

  useEffect(() => {
    // Request native push notification permissions on load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Bullet-proof database reset check to clear old placeholders
    const storedFrames = localStorage.getItem("eyewear_frames");
    if (storedFrames && storedFrames.toLowerCase().includes("wayfarer")) {
      localStorage.clear();
      window.location.reload();
      return;
    }
    const prepareDB = async () => {
      await initDB();
      await refreshState();
    };
    prepareDB();
  }, []);



  const handleSelectUser = (userId) => {
    if (userId) {
      const matched = users.find((u) => u.id === userId);
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem("eyewear_current_user_id", userId);
        setActiveTab("dashboard");
      }
    } else {
      setCurrentUser(null);
      localStorage.removeItem("eyewear_current_user_id");
      setActiveOrderId(null);
      setSelectedOrder(null);
    }
  };



  // Staff checklist handlers
  const handleUpdateChecklist = async (orderId, checklist) => {
    await updateOrderChecklist(orderId, checklist, currentUser.id);
    await refreshState();
  };

  const handleMarkPacked = async (orderId, proofPhotos) => {
    await markOrderPacked(orderId, proofPhotos, currentUser.id);
    setActiveOrderId(null);
    await refreshState();
    triggerWhatsAppToast(currentUser.name, `Order ${orderId} has been successfully packed and is ready for dispatch!`);
  };

  const handleReportIssue = async (orderId, issueType, issueDetails, issuePhoto) => {
    await reportOrderIssue(orderId, issueType, issueDetails, issuePhoto, currentUser.id);
    setActiveOrderId(null);
    await refreshState();
    triggerWhatsAppToast(`${currentUser.name} ⚠️`, `Order ${orderId} is BLOCKED: ${issueType}.`);
  };

  // Manager Actions
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.frameId || !newOrder.frameColor || !newOrder.assignedTo) {
      alert("Please fill out all required fields.");
      return;
    }

    const frame = frames.find((f) => f.id === newOrder.frameId);
    const staff = users.find((u) => u.id === newOrder.assignedTo);

    const isCustom = newOrder.lensCategory === "Custom Lens";
    const resolvedLensColor = isCustom ? newOrder.lensColor : "RX";
    const resolvedLensType = isCustom
      ? "Custom Lens"
      : `Standard Lens${newOrder.hasPrescription ? ` (${newOrder.prescriptionType})` : ""}`;

    const resolvedInstructions = newOrder.specialInstructions + 
      (newOrder.deliveryMode === "Handover" ? " | MODE: Handover" : "");

    const orderData = {
      customerName: newOrder.customerName,
      frameName: frame.name,
      frameColor: newOrder.frameColor,
      lensType: resolvedLensType,
      lensColor: resolvedLensColor,
      specialInstructions: resolvedInstructions,
      assignedTo: newOrder.assignedTo,
      assignedToName: staff.name,
      prescription: {
        hasPrescription: !isCustom && newOrder.hasPrescription,
        prescriptionType: !isCustom && newOrder.hasPrescription ? newOrder.prescriptionType : null
      }
    };

    const created = await createOrder(orderData, currentUser.id);
    setShowCreateModal(false);
    await refreshState();
    triggerWhatsAppToast("System Alert", `New shipment ${created.id} created and assigned to ${orderData.assignedToName || orderData.assignedTo}!`);
    sendWhatsAppNotification(created);

    // Reset Form
    const resetFrame = frames[0];
    const resetColor = resetFrame?.colors[0] || "";
    const resetConfig = getValidLensConfig(resetFrame, resetColor, "Standard Lens");

    setNewOrder({
      customerName: "",
      frameId: resetFrame?.id || "",
      frameColor: resetColor,
      lensCategory: resetConfig.category,
      lensColor: resetConfig.lens,
      specialInstructions: "",
      assignedTo: users.find(u => u.role === "staff")?.id || "",
      hasPrescription: false,
      prescriptionType: "Single Vision",
      deliveryMode: "Shipment"
    });
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNote) return;
    await resolveOrderIssue(selectedOrder.id, resolutionNote, currentUser.id, reassignUserId || null);
    const orderId = selectedOrder.id;
    setSelectedOrder(null);
    setResolutionNote("");
    setReassignUserId("");
    await refreshState();
    triggerWhatsAppToast(currentUser.name, `Blockage cleared for ${orderId}. Resume packing.`);
  };

  const handleApproveDispatch = async (orderId) => {
    await approveOrderDispatch(orderId, currentUser.id);
    setSelectedOrder(null);
    await refreshState();
    triggerWhatsAppToast(`${currentUser.name} (Manager)`, `Order ${orderId} has been approved and dispatched!`);
  };

  // Admin Catalog Handlers
  const handleAddFrame = async (frameData) => {
    await saveFrame(frameData);
    await refreshState();
  };

  const handleDeleteFrame = async (frameId) => {
    await deleteFrame(frameId);
    await refreshState();
  };

  const handleAddLensType = async (type) => {
    await saveLensType(type);
    await refreshState();
  };

  const handleAddLensColor = async (color) => {
    await saveLensColor(color);
    await refreshState();
  };

  const handleAddUser = async (userData) => {
    await saveUser(userData);
    await refreshState();
  };

  // Open detail panel for audit
  const openOrderReview = (orderId) => {
    const o = orders.find((ord) => ord.id === orderId);
    if (o) {
      setSelectedOrder(o);
      localStorage.setItem("active_review_order_id", orderId);
    }
  };

  const closeOrderReview = () => {
    setSelectedOrder(null);
    localStorage.removeItem("active_review_order_id");
  };

  const renderRoleView = () => {
    if (!currentUser) {
      return <LoginScreen users={users} onSelectUser={handleSelectUser} />;
    }

    if (currentUser.role === "staff") {
      // Operations view (Dhanesh)
      return (
        <div className="main-content">
          {activeOrderId ? (
            <PackingScreen
              order={orders.find((o) => o.id === activeOrderId)}
              onBack={() => setActiveOrderId(null)}
              onUpdateChecklist={handleUpdateChecklist}
              onMarkPacked={handleMarkPacked}
              onReportIssue={handleReportIssue}
            />
          ) : (
            <StaffDashboard
              orders={orders}
              currentUser={currentUser}
              onSelectOrder={(id) => setActiveOrderId(id)}
            />
          )}
        </div>
      );
    }

    // Administrator/Manager portal layout (Rohan)
    return (
      <div className="main-layout">
        
        {/* LEFT NAVIGATION SIDEBAR */}
        <div className="sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Terminal info */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Logistics Terminal</div>
              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>Terminal A-12</div>
            </div>

            {/* Nav Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <button
                onClick={() => setActiveTab("dashboard")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: activeTab === "dashboard" ? "#f1f5f9" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: activeTab === "dashboard" ? "#0f172a" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: activeTab === "orders" ? "#f1f5f9" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: activeTab === "orders" ? "#0f172a" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Orders
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: activeTab === "inventory" ? "#f1f5f9" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: activeTab === "inventory" ? "#0f172a" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="18" r="3"></circle><line x1="3" y1="12" x2="21" y2="12"></line><line x1="9" y1="18" x2="15" y2="18"></line><path d="M10 12V6a4 4 0 0 1 8 0v6"></path></svg>
                Inventory
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: activeTab === "staff" ? "#f1f5f9" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: activeTab === "staff" ? "#0f172a" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Staff
              </button>
              <button
                onClick={() => {
                  setLocalSettings(whatsappSettings);
                  setActiveTab("settings");
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  background: activeTab === "settings" ? "#f1f5f9" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: activeTab === "settings" ? "#0f172a" : "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => {
                if (frames.length > 0) {
                  const firstFrame = frames[0];
                  const firstColor = firstFrame.colors[0];
                  const config = getValidLensConfig(firstFrame, firstColor, "Standard Lens");
                  setNewOrder(prev => ({
                    ...prev,
                    frameId: firstFrame.id,
                    frameColor: firstColor,
                    lensCategory: config.category,
                    lensColor: config.lens,
                    hasPrescription: false,
                    prescriptionType: "Single Vision",
                    assignedTo: users.find(u => u.role === "staff")?.id || ""
                  }));
                }
                setShowCreateModal(true);
              }}
              className="btn btn-primary"
              style={{ width: "100%", fontWeight: "700", padding: "12px", backgroundColor: "#000000", border: "none" }}
            >
              NEW SHIPMENT
            </button>
            <a href="#help" style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", paddingLeft: "12px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Help Center
            </a>
          </div>
        </div>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="workspace">
          <Header
            currentUser={currentUser}
            onSwitchUser={handleSelectUser}
            users={users}
          />
          
          <div className="content-pane">
            {activeTab === "dashboard" && (
              <LogisticsDashboard
                orders={orders}
                users={users}
                onSelectOrder={openOrderReview}
              />
            )}
            {activeTab === "orders" && (
              <ManagerDashboard
                orders={orders}
                users={users}
                frames={frames}
                lensTypes={lensTypes}
                lensColors={lensColors}
                currentUser={currentUser}
                onCreateOrder={handleCreateOrder}
                onResolveIssue={handleResolveSubmit}
                onApproveDispatch={handleApproveDispatch}
                onSelectOrder={openOrderReview}
                onOpenCreate={() => setShowCreateModal(true)}
                onWhatsAppNotify={handleWhatsAppNotify}
              />
            )}
            {activeTab === "inventory" && (
              <AdminPanel
                users={users}
                frames={frames}
                lensTypes={lensTypes}
                lensColors={lensColors}
                onAddFrame={handleAddFrame}
                onDeleteFrame={handleDeleteFrame}
                onAddLensType={handleAddLensType}
                onAddLensColor={handleAddLensColor}
                onAddUser={handleAddUser}
                defaultTab="frames"
              />
            )}
            {activeTab === "staff" && (
              <AdminPanel
                users={users}
                frames={frames}
                lensTypes={lensTypes}
                lensColors={lensColors}
                onAddFrame={handleAddFrame}
                onDeleteFrame={handleDeleteFrame}
                onAddLensType={handleAddLensType}
                onAddLensColor={handleAddLensColor}
                onAddUser={handleAddUser}
                defaultTab="users"
              />
            )}
            {activeTab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Header Title */}
                <div>
                  <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>Terminal Config Settings</h1>
                  <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "2px" }}>
                    Configure automated notification channels, CallMeBot integration credentials, and routing parameters.
                  </p>
                </div>

                {/* CallMeBot Settings Card */}
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "28px" }}>
                  <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      Automated Alert Notifications (CallMeBot)
                    </h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                      Configure routing details for live order alerts via WhatsApp or Telegram channels.
                    </p>
                  </div>

                  {/* Setup Guide */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    flexWrap: "wrap"
                  }} className="settings-grid">
                    
                    {/* WhatsApp Guide */}
                    <div style={{
                      backgroundColor: "rgba(37, 211, 102, 0.05)",
                      border: "1px solid rgba(37, 211, 102, 0.2)",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#128C7E", display: "flex", alignItems: "center", gap: "6px" }}>
                        💬 WhatsApp setup
                      </h3>
                      <ol style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <li>Add bot contact <strong>+34 698 28 89 73</strong> to address book.</li>
                        <li>Send WhatsApp text: <code>I allow callmebot to send me messages</code>.</li>
                        <li>Wait for the reply containing your free **API Key**.</li>
                      </ol>
                    </div>

                    {/* Telegram Guide */}
                    <div style={{
                      backgroundColor: "rgba(0, 136, 204, 0.05)",
                      border: "1px solid rgba(0, 136, 204, 0.2)",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}>
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0088cc", display: "flex", alignItems: "center", gap: "6px" }}>
                        ✈️ Telegram Setup (Instant Activation)
                      </h3>
                      <ol style={{ fontSize: "12px", color: "var(--text-secondary)", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <li>Search for <strong>@CallMeBot_txtbot</strong> in Telegram app.</li>
                        <li>Open the chat window and click/type <strong>Start</strong>.</li>
                        <li>The bot will reply **instantly** with your API Key!</li>
                      </ol>
                    </div>
                  </div>

                  {/* User List Configuration forms */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginTop: "8px" }}>
                    {users.map((user) => {
                      const userConf = localSettings[user.id] || { gateway: "whatsapp", phone: "", username: "", apikey: "", enabled: false };
                      const gateway = userConf.gateway || "whatsapp";
                      return (
                        <div key={user.id} style={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "10px",
                          padding: "18px",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: user.avatarColor,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "700"
                              }}>
                                {user.name[0]}
                              </div>
                              <div>
                                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>{user.name}</h4>
                                <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "capitalize", fontWeight: "600" }}>
                                  Role: {user.role}
                                </span>
                              </div>
                            </div>

                            <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                              <input
                                type="checkbox"
                                checked={!!userConf.enabled}
                                onChange={(e) => handleSettingsChange(user.id, "enabled", e.target.checked)}
                                style={{ width: "16px", height: "16px", cursor: "pointer" }}
                              />
                              Enable Live Notifications
                            </label>
                          </div>

                          {/* Channel Selector */}
                          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-secondary)" }}>Channel:</span>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                              <input
                                type="radio"
                                name={`gateway-${user.id}`}
                                value="whatsapp"
                                checked={gateway === "whatsapp"}
                                onChange={() => handleSettingsChange(user.id, "gateway", "whatsapp")}
                                style={{ width: "auto", margin: 0, padding: 0 }}
                              />
                              WhatsApp
                            </label>
                            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                              <input
                                type="radio"
                                name={`gateway-${user.id}`}
                                value="telegram"
                                checked={gateway === "telegram"}
                                onChange={() => handleSettingsChange(user.id, "gateway", "telegram")}
                                style={{ width: "auto", margin: 0, padding: 0 }}
                              />
                              Telegram
                            </label>
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }} className="settings-grid">
                            {gateway === "telegram" ? (
                              <div>
                                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                  Telegram Username (with @)
                                </label>
                                <input
                                  type="text"
                                  placeholder="@username"
                                  value={userConf.username || ""}
                                  onChange={(e) => handleSettingsChange(user.id, "username", e.target.value)}
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: "14px",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-primary)"
                                  }}
                                />
                              </div>
                            ) : (
                              <div>
                                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                  WhatsApp Phone Number (with country code)
                                </label>
                                <input
                                  type="text"
                                  placeholder="+919999999999"
                                  value={userConf.phone || ""}
                                  onChange={(e) => handleSettingsChange(user.id, "phone", e.target.value)}
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: "14px",
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border-color)",
                                    backgroundColor: "var(--bg-input)",
                                    color: "var(--text-primary)"
                                  }}
                                />
                              </div>
                            )}

                            <div>
                              <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", marginBottom: "6px", color: "var(--text-secondary)" }}>
                                {gateway === "telegram" ? "Telegram API Key" : "CallMeBot API Key"}
                              </label>
                              <input
                                type="password"
                                placeholder="Enter API Key"
                                value={userConf.apikey || ""}
                                onChange={(e) => handleSettingsChange(user.id, "apikey", e.target.value)}
                                style={{
                                  padding: "10px 14px",
                                  fontSize: "14px",
                                  borderRadius: "var(--radius-sm)",
                                  border: "1px solid var(--border-color)",
                                  backgroundColor: "var(--bg-input)",
                                  color: "var(--text-primary)"
                                }}
                              />
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                            <button
                              type="button"
                              onClick={() => handleTestNotification(user.id)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                color: gateway === "telegram" ? "#0088cc" : "#128C7E",
                                borderColor: gateway === "telegram" ? "rgba(0, 136, 204, 0.4)" : "rgba(37, 211, 102, 0.4)",
                                backgroundColor: gateway === "telegram" ? "rgba(0, 136, 204, 0.05)" : "rgba(37, 211, 102, 0.05)"
                              }}
                            >
                              📲 Send Test Message
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Footer Bar */}
                  <div style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "20px",
                    marginTop: "8px"
                  }}>
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="btn btn-primary"
                      style={{ backgroundColor: "#000000", border: "none", fontWeight: "700", padding: "12px 24px" }}
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Floating plus button for quick shipment */}
          <button
            onClick={() => {
              if (frames.length > 0) {
                setNewOrder(prev => ({
                  ...prev,
                  frameId: frames[0].id,
                  frameColor: frames[0].colors[0],
                  lensCategory: "Standard Lens",
                  lensColor: "RX",
                  hasPrescription: false,
                  prescriptionType: "Single Vision",
                  assignedTo: users.find(u => u.role === "staff")?.id || ""
                }));
              }
              setShowCreateModal(true);
            }}
            className="floating-plus-btn"
            title="Create New Eyewear Shipment"
          >
            ＋
          </button>
        </div>
      </div>
    );
  };

  const selectedFrame = frames.find((f) => f.id === newOrder.frameId);
  const staffUsers = users.filter((u) => u.role === "staff");

  const availableLenses = selectedFrame && newOrder.frameColor
    ? (selectedFrame.variants || []).filter((v) => v.color === newOrder.frameColor).map((v) => v.lens)
    : [];
  const hasStandardOption = availableLenses.includes("RX");
  const hasCustomOption = availableLenses.some((l) => l !== "RX");
  const availableLensColorsForSelectedColor = availableLenses.filter((l) => l !== "RX");

  return (
    <div className="app-container">
      {/* Top Bar Header */}
      {(!currentUser || currentUser.role !== "admin") && (
        <Header
          currentUser={currentUser}
          onSwitchUser={handleSelectUser}
          users={users}
        />
      )}
      
      {/* Routing Views */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {renderRoleView()}
      </main>

      {/* GLOBAL CREATE ORDER MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: "700" }}>Create Eyewear Shipment</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label htmlFor="modal-cust-name">Customer Name *</label>
                  <input
                    type="text"
                    id="modal-cust-name"
                    placeholder="Sophia Martinez"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label htmlFor="modal-frame-sel">Select Frame Style *</label>
                    <select
                      id="modal-frame-sel"
                      value={newOrder.frameId}
                      onChange={(e) => {
                        const frameId = e.target.value;
                        const frame = frames.find((f) => f.id === frameId);
                        const firstColor = frame ? frame.colors[0] : "";
                        const config = getValidLensConfig(frame, firstColor, newOrder.lensCategory);
                        setNewOrder({
                          ...newOrder,
                          frameId,
                          frameColor: firstColor,
                          lensCategory: config.category,
                          lensColor: config.lens
                        });
                      }}
                      required
                    >
                      <option value="">-- Select Frame --</option>
                      {frames.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-color-sel">Frame Color *</label>
                    <select
                      id="modal-color-sel"
                      value={newOrder.frameColor}
                      onChange={(e) => {
                        const frameColor = e.target.value;
                        const config = getValidLensConfig(selectedFrame, frameColor, newOrder.lensCategory);
                        setNewOrder({
                          ...newOrder,
                          frameColor,
                          lensCategory: config.category,
                          lensColor: config.lens
                        });
                      }}
                      disabled={!newOrder.frameId}
                      required
                    >
                      <option value="">-- Select Color --</option>
                      {selectedFrame?.colors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label htmlFor="modal-lens-category">Lens Category *</label>
                    <select
                      id="modal-lens-category"
                      value={newOrder.lensCategory}
                      onChange={(e) => {
                        const category = e.target.value;
                        const config = getValidLensConfig(selectedFrame, newOrder.frameColor, category);
                        setNewOrder({
                          ...newOrder,
                          lensCategory: config.category,
                          lensColor: config.lens,
                          hasPrescription: false,
                          prescriptionType: "Single Vision"
                        });
                      }}
                      required
                    >
                      {hasStandardOption && <option value="Standard Lens">Standard Lens</option>}
                      {hasCustomOption && <option value="Custom Lens">Custom Lens (Tinted/Colored)</option>}
                    </select>
                  </div>

                  {newOrder.lensCategory === "Custom Lens" ? (
                    <div>
                      <label htmlFor="modal-lenscolor-sel">Lens Color/Tint *</label>
                      <select
                        id="modal-lenscolor-sel"
                        value={newOrder.lensColor}
                        onChange={(e) => setNewOrder({ ...newOrder, lensColor: e.target.value })}
                        required
                      >
                        {availableLensColorsForSelectedColor.length > 0 ? (
                          availableLensColorsForSelectedColor.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))
                        ) : (
                          <option value="">No custom lenses available</option>
                        )}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="modal-has-prescription">Requires Prescription? *</label>
                      <select
                        id="modal-has-prescription"
                        value={newOrder.hasPrescription ? "Yes" : "No"}
                        onChange={(e) => {
                          const hasPres = e.target.value === "Yes";
                          setNewOrder({
                            ...newOrder,
                            hasPrescription: hasPres,
                            prescriptionType: hasPres ? "Single Vision" : ""
                          });
                        }}
                        required
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  )}
                </div>

                {newOrder.lensCategory === "Standard Lens" && newOrder.hasPrescription && (
                  <div style={{ border: "1px solid var(--border-color)", padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-app)" }}>
                    <label htmlFor="modal-prescription-type" style={{ display: "block", marginBottom: "4px", fontSize: "13px", fontWeight: "700" }}>Prescription Lens Type *</label>
                    <select
                      id="modal-prescription-type"
                      value={newOrder.prescriptionType}
                      onChange={(e) => setNewOrder({ ...newOrder, prescriptionType: e.target.value })}
                      required
                    >
                      <option value="Single Vision">Single Vision</option>
                      <option value="Progressive">Progressive</option>
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="modal-instr">Special Packing Instructions</label>
                  <textarea
                    id="modal-instr"
                    rows="2"
                    placeholder="e.g. Include leather case, wrap securely..."
                    value={newOrder.specialInstructions}
                    onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                  ></textarea>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label htmlFor="modal-delivery-mode">Delivery Mode *</label>
                    <select
                      id="modal-delivery-mode"
                      value={newOrder.deliveryMode || "Shipment"}
                      onChange={(e) => setNewOrder({ ...newOrder, deliveryMode: e.target.value })}
                      required
                    >
                      <option value="Shipment">Shipment (Requires Label)</option>
                      <option value="Handover">Direct Handover (No Label)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modal-assignee">Assign Operations Staff *</label>
                    <select
                      id="modal-assignee"
                      value={newOrder.assignedTo}
                      onChange={(e) => setNewOrder({ ...newOrder, assignedTo: e.target.value })}
                      required
                    >
                      <option value="">-- Select Staff --</option>
                      {staffUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL DETAIL / VERIFICATION MODAL */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontWeight: "700" }}>Order Audit ({selectedOrder.id})</h3>
                <span className={`badge badge-${selectedOrder.status.toLowerCase()}`} style={{ marginTop: "4px" }}>
                  {selectedOrder.status}
                </span>
              </div>
              <button onClick={closeOrderReview} style={{ background: "none", border: "none", fontSize: "18px", color: "var(--text-secondary)", cursor: "pointer" }}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: "700" }}>{selectedOrder.frameName} ({selectedOrder.frameColor})</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Lens Type: {selectedOrder.lensType} - {selectedOrder.lensColor}</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Customer: <strong>{selectedOrder.customerName}</strong></p>
                <p style={{ fontSize: "12.5px", color: "var(--color-accent)", fontWeight: "700", marginTop: "4px" }}>Order Price: ₹{selectedOrder.price || 7500}</p>
              </div>

              {selectedOrder.status === "Blocked" && selectedOrder.issue && (
                <div style={{ border: "1px solid var(--color-danger)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <div style={{ backgroundColor: "var(--color-danger-light)", color: "var(--color-danger)", padding: "8px 12px", fontWeight: "700", fontSize: "13px" }}>
                    ⚠️ Blocked Issue Report
                  </div>
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>CATEGORY</span>
                      <div style={{ fontWeight: "700", fontSize: "13px" }}>{selectedOrder.issue.type}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>DETAILS</span>
                      <p style={{ fontSize: "12px", color: "var(--text-primary)" }}>{selectedOrder.issue.details}</p>
                    </div>

                    <form onSubmit={handleResolveSubmit} style={{ borderTop: "1px solid var(--border-color)", paddingTop: "10px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700" }}>Resolve Problem</span>
                      
                      <div>
                        <label htmlFor="modal-resolve-note" style={{ fontSize: "11px" }}>Resolution Action *</label>
                        <input
                          type="text"
                          id="modal-resolve-note"
                          placeholder="What did you do to fix this?"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="modal-reassign" style={{ fontSize: "11px" }}>Reassign Staff</label>
                        <select
                          id="modal-reassign"
                          value={reassignUserId}
                          onChange={(e) => setReassignUserId(e.target.value)}
                        >
                          <option value="">-- Keep Current Staff --</option>
                          {staffUsers.map((su) => (
                            <option key={su.id} value={su.id}>{su.name}</option>
                          ))}
                        </select>
                      </div>

                      <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-end" }}>
                        Resume packing order
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {selectedOrder.status === "Packed" && (
                <div style={{ border: "1px solid var(--color-success)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <div style={{ backgroundColor: "var(--color-success-light)", color: "var(--color-success)", padding: "8px 12px", fontWeight: "700", fontSize: "13px" }}>
                    ✓ Guided Packing Complete
                  </div>
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={() => handleApproveDispatch(selectedOrder.id)}
                      className="btn btn-primary"
                      style={{ backgroundColor: "var(--color-success)", width: "100%", border: "none" }}
                    >
                      Approve and Dispatch
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h4 style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "4px" }}>Order Logs</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                  {selectedOrder.history.map((log, index) => (
                    <div key={index} style={{ display: "flex", justify: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>{new Date(log.updatedAt).toLocaleTimeString()}</span>
                      <span><strong>{log.updatedBy.toUpperCase()}</strong>: {log.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeOrderReview} className="btn btn-secondary btn-sm">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification Container */}
      <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              width: "320px",
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              borderLeft: "5px solid #25D366",
              borderRadius: "8px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              animation: "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* WhatsApp Icon/Avatar */}
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#25D366", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px", flexShrink: 0 }}>
              💬
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#128C7E" }}>{toast.senderName}</span>
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>WhatsApp</span>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px", lineHeight: "1.3" }}>{toast.messageText}</p>
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} style={{ background: "none", border: "none", fontSize: "14px", color: "#94a3b8", cursor: "pointer", alignSelf: "flex-start", padding: "2px" }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
