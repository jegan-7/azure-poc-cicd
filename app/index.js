const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const KEY_VAULT_URI = process.env.KEY_VAULT_URI || "not-configured";

// ─────────────────────────────────────────────
// Health check endpoint (used by Container Apps probes)
// ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// Root endpoint
// ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    message: "Azure PoC Application",
    version: "1.0.0",
    environment: NODE_ENV,
    keyVaultConfigured: KEY_VAULT_URI !== "not-configured",
  });
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Environment : ${NODE_ENV}`);
  console.log(`   Key Vault   : ${KEY_VAULT_URI}`);
});
