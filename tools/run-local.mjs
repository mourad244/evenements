import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const runOnce = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed (${code})`));
      }
    });
  });

const children = [];
const runLong = (command, args) => {
  const child = spawn(command, args, { stdio: "inherit", shell: true });
  children.push(child);
  return child;
};

const waitForGatewayReady = async () => {
  const url = "http://localhost:4000/ready";
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log("Gateway ready.");
        return true;
      }
    } catch (err) {
      // keep trying
    }
    await delay(2000);
  }
  console.log("Gateway not ready yet. Continuing.");
  return false;
};

const stopChildren = () => {
  for (const child of children) {
    try {
      child.kill();
    } catch (err) {
      // ignore
    }
  }
};

process.on("SIGINT", () => {
  console.log("\nStopping local dev processes...");
  stopChildren();
  process.exit(0);
});

console.log("Starting backend (Docker)...");
await runOnce("docker", ["compose", "-f", "docker-compose.backend.yml", "up", "-d"]);
await waitForGatewayReady();

console.log("Starting frontend (Next dev)...");
runLong("corepack", ["pnpm", "-C", "frontend", "dev"]);

console.log("Starting docs (Docusaurus)...");
runLong("corepack", ["pnpm", "--filter", "docs-portal", "start", "--", "--port", "3001"]);

console.log("\nLocal stack is running:");
console.log("- Frontend: http://localhost:3000");
console.log("- Docs:     http://localhost:3001");
console.log("- Gateway:  http://localhost:4000/ready");
console.log("- Ops:      http://localhost:7331 (run: node tools/ops-dashboard-server.cjs)");
console.log("\nPress Ctrl+C to stop frontend + docs. Backend stays up.");

await new Promise(() => {});
