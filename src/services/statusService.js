const https = require("https");

const OPENAI_STATUS_URL = "https://status.openai.com/api/v2/summary.json";
const CLAUDE_STATUS_URL = "https://status.claude.com/api/v2/summary.json";
const CACHE_TTL_MS = 60 * 1000;

let cache = null;
let cacheTime = 0;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: "application/json" } }, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Status request failed: ${res.statusCode}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("Status response is not valid JSON"));
        }
      });
    });

    req.setTimeout(8000, () => {
      req.destroy(new Error("Status request timed out"));
    });

    req.on("error", reject);
  });
}

function findComponent(summary, componentName) {
  return (summary.components || []).find((component) => component.name === componentName);
}

function publicStatus(source, label, component) {
  return {
    source,
    label,
    status: component?.status || "unknown",
    updatedAt: component?.updated_at || null,
  };
}

async function getAiStatus() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL_MS) return cache;

  const [openai, claude] = await Promise.all([
    fetchJson(OPENAI_STATUS_URL),
    fetchJson(CLAUDE_STATUS_URL),
  ]);

  cache = {
    fetchedAt: new Date().toISOString(),
    services: [
      publicStatus("OpenAI", "ChatGPT", findComponent(openai, "App")),
      publicStatus("OpenAI", "Codex", findComponent(openai, "Codex Web")),
      publicStatus("Claude", "Claude.ai", findComponent(claude, "claude.ai")),
      publicStatus("Claude", "Claude Code", findComponent(claude, "Claude Code")),
    ],
  };
  cacheTime = now;
  return cache;
}

module.exports = {
  getAiStatus,
};
