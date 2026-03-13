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
// Root endpoint — serves HTML UI
// ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  const keyVaultConfigured = KEY_VAULT_URI !== "not-configured";

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Azure PoC — ${NODE_ENV}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0e1a;
      --surface: #111827;
      --border: #1f2d45;
      --accent: #0ea5e9;
      --accent2: #38bdf8;
      --green: #22c55e;
      --yellow: #facc15;
      --red: #f87171;
      --text: #e2e8f0;
      --muted: #64748b;
      --font-head: 'Syne', sans-serif;
      --font-mono: 'Space Mono', monospace;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-mono);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow-x: hidden;
    }

    /* Background grid */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      z-index: 0;
    }

    .wrapper {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 700px;
      animation: fadeUp 0.6s ease both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .header {
      margin-bottom: 2.5rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(14,165,233,0.1);
      border: 1px solid rgba(14,165,233,0.3);
      color: var(--accent2);
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 999px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 1rem;
      animation: fadeUp 0.6s 0.1s ease both;
    }

    .badge::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 6px var(--green);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    h1 {
      font-family: var(--font-head);
      font-size: clamp(1.8rem, 5vw, 2.8rem);
      font-weight: 800;
      line-height: 1.1;
      color: #fff;
      animation: fadeUp 0.6s 0.15s ease both;
    }

    h1 span {
      color: var(--accent);
    }

    .subtitle {
      color: var(--muted);
      font-size: 0.75rem;
      margin-top: 0.6rem;
      letter-spacing: 0.05em;
      animation: fadeUp 0.6s 0.2s ease both;
    }

    /* Cards grid */
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
      animation: fadeUp 0.6s 0.25s ease both;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      transition: border-color 0.2s, transform 0.2s;
    }

    .card:hover {
      border-color: rgba(14,165,233,0.4);
      transform: translateY(-2px);
    }

    .card-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 0.4rem;
    }

    .card-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      font-family: var(--font-head);
    }

    .card-value.accent { color: var(--accent); }
    .card-value.green  { color: var(--green);  }
    .card-value.yellow { color: var(--yellow); }

    /* Status card — full width */
    .card-full {
      grid-column: 1 / -1;
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .status-dot {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--green);
    }

    .status-dot::before {
      content: '';
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
      animation: pulse 2s infinite;
    }

    .keyvault-badge {
      font-size: 0.7rem;
      padding: 3px 10px;
      border-radius: 999px;
      font-family: var(--font-mono);
    }

    .keyvault-badge.ok {
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      color: var(--green);
    }

    .keyvault-badge.warn {
      background: rgba(250,204,21,0.1);
      border: 1px solid rgba(250,204,21,0.3);
      color: var(--yellow);
    }

    /* Endpoints */
    .endpoints {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      animation: fadeUp 0.6s 0.3s ease both;
      margin-bottom: 1rem;
    }

    .endpoints-title {
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 0.8rem;
    }

    .endpoint-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border);
      font-size: 0.78rem;
    }

    .endpoint-row:last-child { border-bottom: none; }

    .method {
      font-size: 0.6rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      background: rgba(14,165,233,0.15);
      color: var(--accent);
      letter-spacing: 0.05em;
      min-width: 38px;
      text-align: center;
    }

    .path {
      color: var(--text);
      flex: 1;
    }

    .ep-desc {
      color: var(--muted);
      font-size: 0.7rem;
    }

    /* Footer */
    .footer {
      text-align: center;
      font-size: 0.65rem;
      color: var(--muted);
      letter-spacing: 0.08em;
      animation: fadeUp 0.6s 0.35s ease both;
    }

    .footer a {
      color: var(--accent);
      text-decoration: none;
    }

    @media (max-width: 480px) {
      .grid { grid-template-columns: 1fr; }
      .card-full { grid-column: 1; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">Azure Container Apps · POC</div>
      <h1>Azure <span>PoC</span><br/>Application</h1>
      <p class="subtitle">v1.0.0 · Node.js + Express · Deployed via GitHub Actions</p>
    </div>

    <div class="grid">
      <!-- Status -->
      <div class="card card-full">
        <div class="card-label">Application Status</div>
        <div class="status-row">
          <span class="status-dot">Running</span>
          <span class="keyvault-badge ${keyVaultConfigured ? 'ok' : 'warn'}">
            Key Vault: ${keyVaultConfigured ? '✓ Configured' : '⚠ Not Configured'}
          </span>
        </div>
      </div>

      <!-- Environment -->
      <div class="card">
        <div class="card-label">Environment</div>
        <div class="card-value accent">${NODE_ENV}</div>
      </div>

      <!-- Version -->
      <div class="card">
        <div class="card-label">Version</div>
        <div class="card-value green">1.0.0</div>
      </div>

      <!-- Runtime -->
      <div class="card">
        <div class="card-label">Runtime</div>
        <div class="card-value">Node.js</div>
      </div>

      <!-- Port -->
      <div class="card">
        <div class="card-label">Port</div>
        <div class="card-value yellow">${PORT}</div>
      </div>
    </div>

    <!-- Endpoints -->
    <div class="endpoints">
      <div class="endpoints-title">Available Endpoints</div>
      <div class="endpoint-row">
        <span class="method">GET</span>
        <span class="path">/</span>
        <span class="ep-desc">Application dashboard</span>
      </div>
      <div class="endpoint-row">
        <span class="method">GET</span>
        <span class="path">/health</span>
        <span class="ep-desc">Health check probe</span>
      </div>
    </div>

    <div class="footer">
      Deployed on Azure Container Apps &nbsp;·&nbsp;
      Managed by Terraform &nbsp;·&nbsp;
      Pipeline via GitHub Actions
    </div>
  </div>
</body>
</html>`);
});

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   Environment : ${NODE_ENV}`);
  console.log(`   Key Vault   : ${KEY_VAULT_URI}`);
});