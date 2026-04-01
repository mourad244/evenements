const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 7331);
const ROOT = path.resolve(__dirname, "..");
const DASHBOARD_PATH = path.join(ROOT, "ops-dashboard.html");

const services = [
  { name: "App (frontend)", url: "http://localhost:3000" },
  { name: "Docs", url: "http://localhost:3001" },
  { name: "Gateway /ready", url: "http://localhost:4000/ready" },
  { name: "Identity /ready", url: "http://localhost:4001/ready" },
  { name: "Event Mgmt /ready", url: "http://localhost:4002/ready" },
  { name: "Registration /ready", url: "http://localhost:4003/ready" }
];

async function checkService(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    const label = error?.name === "AbortError" ? "timeout" : "error";
    return { ok: false, error: label };
  } finally {
    clearTimeout(timer);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    fs.readFile(DASHBOARD_PATH, "utf8", (err, html) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Dashboard file not found.");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    return;
  }

  if (req.method === "GET" && req.url === "/api/status") {
    const results = await Promise.all(
      services.map(async (service) => {
        const result = await checkService(service.url);
        return { ...service, ...result };
      })
    );
    const payload = JSON.stringify({
      checkedAt: new Date().toISOString(),
      services: results
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(payload);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found.");
});

server.listen(PORT, () => {
  console.log(`Ops dashboard running at http://localhost:${PORT}`);
});
