const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readCollection, writeCollection } = require("./sqliteStore");

const dataDir = path.join(__dirname, "../../data");
const ordersFile = path.join(dataDir, "orders.json");

function ensureStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]\n");
}

function formatTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function generateOrderId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `ORD-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function readOrders() {
  if (sqliteEnabled()) return readCollection("orders", ordersFile);
  ensureStore();
  return JSON.parse(fs.readFileSync(ordersFile, "utf8"));
}

function writeOrders(orders) {
  if (sqliteEnabled()) {
    writeCollection("orders", orders);
    return;
  }
  ensureStore();
  fs.writeFileSync(ordersFile, `${JSON.stringify(orders, null, 2)}\n`);
}

function findOrderById(orderId) {
  const orders = readOrders();
  return orders.find((order) => order.id === orderId);
}

function findOrderByIdentity(orderId, contact) {
  const normalizedOrderId = String(orderId || "").trim();
  const normalizedContact = String(contact || "").trim().toLowerCase();
  if (!normalizedOrderId || !normalizedContact) return null;

  const orders = readOrders();
  return (
    orders.find(
      (order) =>
        order.id === normalizedOrderId &&
        String(order.contact || "").trim().toLowerCase() === normalizedContact
    ) || null
  );
}

function findOrdersByLookup(lookup) {
  const normalizedLookup = String(lookup || "").trim().toLowerCase();
  if (!normalizedLookup) return [];

  return readOrders().filter(
    (order) =>
      String(order.id || "").trim().toLowerCase() === normalizedLookup ||
      String(order.contact || "").trim().toLowerCase() === normalizedLookup
  );
}

function createOrder(orderData) {
  const now = formatTime();
  const order = {
    id: generateOrderId(),
    ...orderData,
    time: now,
    createdAt: now,
    updatedAt: now,
  };
  const orders = readOrders();
  orders.unshift(order);
  writeOrders(orders);
  return order;
}

function updateOrder(orderId, updateData) {
  const orders = readOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updateData,
    updatedAt: formatTime(),
  };
  writeOrders(orders);
  return orders[index];
}

function queryOrders(filters = {}) {
  let orders = readOrders();

  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    orders = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(keyword) ||
        String(order.contact).toLowerCase().includes(keyword)
    );
  }

  return orders.sort((a, b) =>
    String(b.createdAt).localeCompare(String(a.createdAt))
  );
}

function publicOrder(order) {
  return {
    id: order.id,
    productId: order.productId,
    productName: order.productName,
    amount: order.amount,
    contact: order.contact,
    payment: order.payment,
    status: order.status,
    time: order.time,
    paidAt: order.paidAt,
    gatewayTradeNo: order.gatewayTradeNo,
  };
}

module.exports = {
  ensureStore,
  formatTime,
  generateOrderId,
  readOrders,
  writeOrders,
  findOrderById,
  findOrderByIdentity,
  findOrdersByLookup,
  createOrder,
  updateOrder,
  queryOrders,
  publicOrder,
};
