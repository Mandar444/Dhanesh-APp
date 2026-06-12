import { supabase, isSupabaseLive } from "./supabaseClient";
import {
  initialUsers,
  initialFrames,
  initialLensTypes,
  initialLensColors,
  initialOrders
} from "./mockData";

const KEYS = {
  USERS: "eyewear_users",
  FRAMES: "eyewear_frames",
  LENS_TYPES: "eyewear_lens_types",
  LENS_COLORS: "eyewear_lens_colors",
  ORDERS: "eyewear_orders"
};

const getLocal = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const initDB = async () => {
  if (isSupabaseLive) {
    return;
  }

  const oldOrders = localStorage.getItem(KEYS.ORDERS);
  const oldUsers = localStorage.getItem(KEYS.USERS);
  const oldFrames = localStorage.getItem(KEYS.FRAMES);
  
  const needsReset = 
    (oldOrders && oldOrders.includes('"id":"ORD-8612"')) || 
    (oldUsers && (oldUsers.includes('"id":"sarah"') || oldUsers.includes("Dhanesh K."))) ||
    (oldFrames && !oldFrames.includes("Borderline"));
  
  if (needsReset) {
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.FRAMES);
    localStorage.removeItem(KEYS.LENS_TYPES);
    localStorage.removeItem(KEYS.LENS_COLORS);
    localStorage.removeItem(KEYS.ORDERS);
    localStorage.removeItem("eyewear_current_user_id");
  }

  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(KEYS.FRAMES)) {
    localStorage.setItem(KEYS.FRAMES, JSON.stringify(initialFrames));
  }
  if (!localStorage.getItem(KEYS.LENS_TYPES)) {
    localStorage.setItem(KEYS.LENS_TYPES, JSON.stringify(initialLensTypes));
  }
  if (!localStorage.getItem(KEYS.LENS_COLORS)) {
    localStorage.setItem(KEYS.LENS_COLORS, JSON.stringify(initialLensColors));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
  }
};

export const getUsers = async () => {
  if (isSupabaseLive) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching users from Supabase:", error);
      return [];
    }
    return data.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatarColor: u.avatar_color
    }));
  }
  return getLocal(KEYS.USERS);
};

export const saveUser = async (user) => {
  if (isSupabaseLive) {
    const { error } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar_color: user.avatarColor
      });
    if (error) console.error("Error saving user in Supabase:", error);
    return getUsers();
  }
  const users = getLocal(KEYS.USERS);
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setLocal(KEYS.USERS, users);
  return users;
};

export const getFrames = async () => {
  if (isSupabaseLive) {
    const { data, error } = await supabase
      .from("frames")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching frames from Supabase:", error);
      return [];
    }
    return data;
  }
  return getLocal(KEYS.FRAMES);
};

export const saveFrame = async (frame) => {
  if (isSupabaseLive) {
    const { error } = await supabase
      .from("frames")
      .upsert({
        id: frame.id,
        name: frame.name,
        colors: frame.colors,
        variants: frame.variants || []
      });
    if (error) console.error("Error saving frame in Supabase:", error);
    return getFrames();
  }
  const frames = getLocal(KEYS.FRAMES);
  const index = frames.findIndex((f) => f.id === frame.id);
  if (index >= 0) {
    frames[index] = frame;
  } else {
    frames.push(frame);
  }
  setLocal(KEYS.FRAMES, frames);
  return frames;
};

export const deleteFrame = async (frameId) => {
  if (isSupabaseLive) {
    const { error } = await supabase
      .from("frames")
      .delete()
      .eq("id", frameId);
    if (error) console.error("Error deleting frame in Supabase:", error);
    return getFrames();
  }
  const frames = getLocal(KEYS.FRAMES).filter((f) => f.id !== frameId);
  setLocal(KEYS.FRAMES, frames);
  return frames;
};

export const getLensTypes = async () => {
  return getLocal(KEYS.LENS_TYPES);
};

export const saveLensType = async (type) => {
  const types = getLensTypes();
  if (!types.includes(type)) {
    types.push(type);
    setLocal(KEYS.LENS_TYPES, types);
  }
  return types;
};

export const getLensColors = async () => {
  return getLocal(KEYS.LENS_COLORS);
};

export const saveLensColor = async (color) => {
  const colors = getLensColors();
  if (!colors.includes(color)) {
    colors.push(color);
    setLocal(KEYS.LENS_COLORS, colors);
  }
  return colors;
};

export const getOrders = async () => {
  if (isSupabaseLive) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching orders from Supabase:", error);
      return [];
    }
    return data.map(o => ({
      id: o.id,
      customerName: o.customer_name,
      frameName: o.frame_name,
      frameColor: o.frame_color,
      lensType: o.lens_type,
      lensColor: o.lens_color,
      price: o.price,
      prescription: o.prescription,
      specialInstructions: o.special_instructions,
      assignedTo: o.assigned_to,
      status: o.status,
      checklist: o.checklist,
      proofPhotos: o.proof_photos || [],
      issue: o.issue,
      history: o.history || [],
      createdAt: o.created_at
    }));
  }
  return getLocal(KEYS.ORDERS);
};

export const getOrderById = async (id) => {
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
};

export const createOrder = async (orderData, managerId) => {
  const orders = await getOrders();
  const lastOrder = orders.reduce((max, order) => {
    const num = parseInt(order.id.split("-")[1]) || 1000;
    return num > max ? num : max;
  }, 1000);
  const newId = `ORD-${lastOrder + 1}`;

  const frames = await getFrames();
  const frame = frames.find((f) => f.name === orderData.frameName);
  const variant = frame?.variants?.find((v) => v.color === orderData.frameColor && v.lens === orderData.lensColor);
  const calculatedPrice = variant ? variant.price : 7500;

  const newOrder = {
    id: newId,
    customerName: orderData.customerName,
    frameName: orderData.frameName,
    frameColor: orderData.frameColor,
    lensType: orderData.lensType,
    lensColor: orderData.lensColor,
    price: calculatedPrice,
    prescription: orderData.prescription || { hasPrescription: false },
    specialInstructions: orderData.specialInstructions || "",
    assignedTo: orderData.assignedTo || "",
    status: "Waiting",
    checklist: {
      confirmFrame: false,
      verifyLens: false,
      addCase: false,
      addCloth: false,
      includeInvoice: false,
      preparePackage: false
    },
    proofPhotos: [],
    issue: null,
    history: [
      {
        status: "Waiting",
        updatedBy: managerId,
        updatedAt: new Date().toISOString(),
        note: `Order created and assigned to ${orderData.assignedToName || orderData.assignedTo}`
      }
    ]
  };

  if (isSupabaseLive) {
    const { error } = await supabase
      .from("orders")
      .insert({
        id: newOrder.id,
        customer_name: newOrder.customerName,
        frame_name: newOrder.frameName,
        frame_color: newOrder.frameColor,
        lens_type: newOrder.lensType,
        lens_color: newOrder.lensColor,
        price: newOrder.price,
        prescription: newOrder.prescription,
        special_instructions: newOrder.specialInstructions,
        assigned_to: newOrder.assignedTo || null,
        status: newOrder.status,
        checklist: newOrder.checklist,
        proof_photos: newOrder.proofPhotos,
        issue: newOrder.issue,
        history: newOrder.history
      });
    if (error) console.error("Error creating order in Supabase:", error);
    return newOrder;
  }

  orders.unshift(newOrder);
  setLocal(KEYS.ORDERS, orders);
  return newOrder;
};

export const updateOrderChecklist = async (orderId, checklist, userId) => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    const order = orders[index];
    order.checklist = checklist;
    if (order.status === "Waiting") {
      order.status = "Packing";
      order.history.push({
        status: "Packing",
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
        note: "Started packing (checklist active)"
      });
    }

    if (isSupabaseLive) {
      const { error } = await supabase
        .from("orders")
        .update({
          checklist: order.checklist,
          status: order.status,
          history: order.history
        })
        .eq("id", orderId);
      if (error) console.error("Error updating checklist in Supabase:", error);
      return order;
    }

    const localOrders = getLocal(KEYS.ORDERS);
    const localIndex = localOrders.findIndex((o) => o.id === orderId);
    if (localIndex >= 0) {
      localOrders[localIndex].checklist = order.checklist;
      localOrders[localIndex].status = order.status;
      localOrders[localIndex].history = order.history;
      setLocal(KEYS.ORDERS, localOrders);
    }
    return order;
  }
  return null;
};

export const markOrderPacked = async (orderId, proofPhotos, userId) => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    const order = orders[index];
    order.status = "Packed";
    order.proofPhotos = proofPhotos;
    order.issue = null;
    order.history.push({
      status: "Packed",
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
      note: "Successfully completed guided packing and uploaded proof photos"
    });

    if (isSupabaseLive) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: order.status,
          proof_photos: order.proofPhotos,
          issue: order.issue,
          history: order.history
        })
        .eq("id", orderId);
      if (error) console.error("Error marking packed in Supabase:", error);
      return order;
    }

    const localOrders = getLocal(KEYS.ORDERS);
    const localIndex = localOrders.findIndex((o) => o.id === orderId);
    if (localIndex >= 0) {
      localOrders[localIndex].status = order.status;
      localOrders[localIndex].proofPhotos = order.proofPhotos;
      localOrders[localIndex].issue = order.issue;
      localOrders[localIndex].history = order.history;
      setLocal(KEYS.ORDERS, localOrders);
    }
    return order;
  }
  return null;
};

export const reportOrderIssue = async (orderId, issueType, issueDetails, issuePhoto, userId) => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    const order = orders[index];
    order.status = "Blocked";
    order.issue = {
      type: issueType,
      details: issueDetails,
      photo: issuePhoto,
      reportedBy: userId,
      reportedAt: new Date().toISOString()
    };
    order.history.push({
      status: "Blocked",
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
      note: `Reported issue: ${issueType}. Details: ${issueDetails}`
    });

    if (isSupabaseLive) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: order.status,
          issue: order.issue,
          history: order.history
        })
        .eq("id", orderId);
      if (error) console.error("Error reporting issue in Supabase:", error);
      return order;
    }

    const localOrders = getLocal(KEYS.ORDERS);
    const localIndex = localOrders.findIndex((o) => o.id === orderId);
    if (localIndex >= 0) {
      localOrders[localIndex].status = order.status;
      localOrders[localIndex].issue = order.issue;
      localOrders[localIndex].history = order.history;
      setLocal(KEYS.ORDERS, localOrders);
    }
    return order;
  }
  return null;
};

export const resolveOrderIssue = async (orderId, resolution, managerId, reassignTo = null) => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    const order = orders[index];
    order.status = "Waiting";
    order.issue = null;
    if (reassignTo) {
      order.assignedTo = reassignTo;
    }
    order.history.push({
      status: "Waiting",
      updatedBy: managerId,
      updatedAt: new Date().toISOString(),
      note: `Issue resolved. Action: ${resolution}${reassignTo ? `. Reassigned to ${reassignTo}` : ""}`
    });

    if (isSupabaseLive) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: order.status,
          issue: order.issue,
          assigned_to: order.assignedTo || null,
          history: order.history
        })
        .eq("id", orderId);
      if (error) console.error("Error resolving issue in Supabase:", error);
      return order;
    }

    const localOrders = getLocal(KEYS.ORDERS);
    const localIndex = localOrders.findIndex((o) => o.id === orderId);
    if (localIndex >= 0) {
      localOrders[localIndex].status = order.status;
      localOrders[localIndex].issue = order.issue;
      localOrders[localIndex].assignedTo = order.assignedTo;
      localOrders[localIndex].history = order.history;
      setLocal(KEYS.ORDERS, localOrders);
    }
    return order;
  }
  return null;
};

export const approveOrderDispatch = async (orderId, managerId) => {
  const orders = await getOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index >= 0) {
    const order = orders[index];
    order.status = "Dispatched";
    order.history.push({
      status: "Dispatched",
      updatedBy: managerId,
      updatedAt: new Date().toISOString(),
      note: "Dispatched approved. Packed items ready for shipping."
    });

    if (isSupabaseLive) {
      const { error } = await supabase
        .from("orders")
        .update({
          status: order.status,
          history: order.history
        })
        .eq("id", orderId);
      if (error) console.error("Error approving dispatch in Supabase:", error);
      return order;
    }

    const localOrders = getLocal(KEYS.ORDERS);
    const localIndex = localOrders.findIndex((o) => o.id === orderId);
    if (localIndex >= 0) {
      localOrders[localIndex].status = order.status;
      localOrders[localIndex].history = order.history;
      setLocal(KEYS.ORDERS, localOrders);
    }
    return order;
  }
  return null;
};
