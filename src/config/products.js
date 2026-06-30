const fs = require("fs");
const path = require("path");
const { sqliteEnabled, ensureSqliteStore, readCollection, writeCollection } = require("../services/sqliteStore");

const dataDir = path.join(__dirname, "../../data");
const productsFile = path.join(dataDir, "products.json");

function ensureProductsStore() {
  if (sqliteEnabled()) {
    ensureSqliteStore();
    return;
  }
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "[]\n");
}

function readProducts() {
  if (sqliteEnabled()) return readCollection("products", productsFile);
  ensureProductsStore();
  return JSON.parse(fs.readFileSync(productsFile, "utf8"));
}

function writeProducts(products) {
  if (sqliteEnabled()) {
    writeCollection("products", products);
    return;
  }
  ensureProductsStore();
  fs.writeFileSync(productsFile, `${JSON.stringify(products, null, 2)}\n`);
}

function getProduct(productId) {
  return readProducts().find((product) => product.id === productId);
}

function getAllProducts() {
  return readProducts();
}

function updateProduct(productId, updateData) {
  const products = readProducts();
  const index = products.findIndex((product) => product.id === productId);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updateData,
    id: productId,
  };
  writeProducts(products);
  return products[index];
}

module.exports = {
  ensureProductsStore,
  getProduct,
  getAllProducts,
  readProducts,
  writeProducts,
  updateProduct,
};
