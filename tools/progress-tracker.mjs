#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const VALID_STATUSES = new Set([
  "TODO",
  "IN_PROGRESS",
  "PARTIAL",
  "DONE",
  "BLOCKED"
]);

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "for",
  "of",
  "on",
  "in",
  "with",
  "is",
  "are",
  "be",
  "this",
  "that",
  "it",
  "as",
  "at",
  "by",
  "from",
  "up",
  "if",
  "then",
  "so",
  "plus",
  "add",
  "wire",
  "start",
  "implementation",
  "sprint",
  "task"
]);

function parseArgs(argv) {
  const [command, ...rest] = argv.slice(2);
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = "true";
      continue;
    }
    flags[key] = next;
    i += 1;
  }
  return { command, flags };
}

function nowIso() {
  return new Date().toISOString();
}

function loadTracker(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absolutePath, "utf8");
  const data = JSON.parse(raw);
  return { data, absolutePath };
}

function saveTracker(filePath, data) {
  data.meta.last_updated = nowIso();
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9/ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const normalized = normalizeText(text);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function scoreTaskMatch(task, prompt) {
  const taskText = [
    task.title,
    ...(task.aliases || []),
    ...(task.refs || []),
    task.id
  ].join(" ");
  const promptTokens = tokenize(prompt);
  const taskTokens = new Set(tokenize(taskText));
  if (promptTokens.length === 0 || taskTokens.size === 0) {
    return 0;
  }

  let overlap = 0;
  for (const token of promptTokens) {
    if (taskTokens.has(token)) overlap += 1;
  }

  const normalizedPrompt = normalizeText(prompt);
  const normalizedTitle = normalizeText(task.title);
  const containsBoost =
    normalizedPrompt.includes(normalizedTitle) ||
    normalizedTitle.includes(normalizedPrompt);

  const baseScore = overlap / promptTokens.length;
  return containsBoost ? baseScore + 1 : baseScore;
}

function resolveTaskByPrompt(tasks, prompt) {
  let winner = null;
  let winnerScore = 0;
  for (const task of tasks) {
    const score = scoreTaskMatch(task, prompt);
    if (score > winnerScore) {
      winner = task;
      winnerScore = score;
    }
  }
  if (!winner || winnerScore < 0.2) {
    return null;
  }
  return winner;
}

function resolveTaskById(tasks, id) {
  return tasks.find((task) => task.id === id) || null;
}

function appendTaskNote(task, status, text) {
  const note = {
    date: nowIso(),
    status,
    text: text || ""
  };
  if (!Array.isArray(task.notes)) task.notes = [];
  task.notes.push(note);
}

function updateTaskStatus(task, status, note) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Invalid status "${status}". Expected one of: ${[...VALID_STATUSES].join(", ")}`);
  }
  task.status = status;
  task.updated_at = nowIso();
  appendTaskNote(task, status, note || "");
}

function statusCounts(tasks) {
  const counts = {};
  for (const status of VALID_STATUSES) counts[status] = 0;
  for (const task of tasks) {
    counts[task.status] = (counts[task.status] || 0) + 1;
  }
  return counts;
}

function renderMarkdown(data) {
  const counts = statusCounts(data.tasks);
  const lines = [];
  lines.push(`# ${data.meta.name} - Execution Tracker`);
  lines.push("");
  lines.push(`- Sprint: \`${data.meta.sprint_id}\``);
  lines.push(`- Source: \`${data.meta.source}\``);
  lines.push(`- Last updated: \`${data.meta.last_updated}\``);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- TODO: \`${counts.TODO}\``);
  lines.push(`- IN_PROGRESS: \`${counts.IN_PROGRESS}\``);
  lines.push(`- PARTIAL: \`${counts.PARTIAL}\``);
  lines.push(`- DONE: \`${counts.DONE}\``);
  lines.push(`- BLOCKED: \`${counts.BLOCKED}\``);
  lines.push("");
  lines.push("## Tasks");
  lines.push("");
  lines.push("| ID | Status | Priority | Refs | Task | Last update |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const task of data.tasks) {
    lines.push(
      `| ${task.id} | ${task.status} | ${task.priority || "-"} | ${(task.refs || []).join(", ")} | ${task.title} | ${task.updated_at || "-"} |`
    );
  }
  lines.push("");
  lines.push("## Latest Notes");
  lines.push("");
  for (const task of data.tasks) {
    const latestNote =
      Array.isArray(task.notes) && task.notes.length > 0
        ? task.notes[task.notes.length - 1]
        : null;
    if (!latestNote) continue;
    lines.push(`- \`${task.id}\` \`${latestNote.status}\` (${latestNote.date}): ${latestNote.text}`);
  }
  lines.push("");
  return lines.join("\n");
}

function printUsage() {
  const usage = `
Usage:
  node tools/progress-tracker.mjs show [--file <tracker.json>]
  node tools/progress-tracker.mjs set --id <TASK_ID> --status <STATUS> [--note "..."] [--file <tracker.json>]
  node tools/progress-tracker.mjs auto-start --prompt "<user prompt>" [--note "..."] [--file <tracker.json>]
  node tools/progress-tracker.mjs auto-complete --prompt "<user prompt>" --result <DONE|PARTIAL|BLOCKED|TODO> [--note "..."] [--file <tracker.json>]
  node tools/progress-tracker.mjs render [--file <tracker.json>] [--output <markdown.md>]
`;
  process.stdout.write(usage);
}

function requireFlag(flags, key) {
  if (!flags[key]) {
    throw new Error(`Missing required flag --${key}`);
  }
  return flags[key];
}

function main() {
  const { command, flags } = parseArgs(process.argv);
  if (!command) {
    printUsage();
    process.exit(1);
  }

  const trackerFile = flags.file || ".codex/progress/sprint_1_tracker.json";
  const { data, absolutePath } = loadTracker(trackerFile);

  if (command === "show") {
    process.stdout.write(`${renderMarkdown(data)}\n`);
    return;
  }

  if (command === "set") {
    const id = requireFlag(flags, "id");
    const status = requireFlag(flags, "status");
    const task = resolveTaskById(data.tasks, id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }
    updateTaskStatus(task, status, flags.note || "");
    saveTracker(absolutePath, data);
    process.stdout.write(`${task.id} -> ${task.status}\n`);
    return;
  }

  if (command === "auto-start") {
    const prompt = requireFlag(flags, "prompt");
    const task = resolveTaskByPrompt(data.tasks, prompt);
    if (!task) {
      throw new Error("No matching task found from prompt text");
    }
    updateTaskStatus(task, "IN_PROGRESS", flags.note || `Auto-start from prompt: ${prompt}`);
    saveTracker(absolutePath, data);
    process.stdout.write(`${task.id} -> ${task.status}\n`);
    return;
  }

  if (command === "auto-complete") {
    const prompt = requireFlag(flags, "prompt");
    const result = requireFlag(flags, "result");
    const task = resolveTaskByPrompt(data.tasks, prompt);
    if (!task) {
      throw new Error("No matching task found from prompt text");
    }
    updateTaskStatus(task, result, flags.note || `Auto-complete from prompt: ${prompt}`);
    saveTracker(absolutePath, data);
    process.stdout.write(`${task.id} -> ${task.status}\n`);
    return;
  }

  if (command === "render") {
    const markdown = renderMarkdown(data);
    const output = flags.output || "docs/sprints/sprint_1_execution_tracker.md";
    const outputPath = path.resolve(process.cwd(), output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${markdown}\n`, "utf8");
    process.stdout.write(`Rendered ${output}\n`);
    return;
  }

  printUsage();
  process.exit(1);
}

try {
  main();
} catch (err) {
  process.stderr.write(`${err.message}\n`);
  process.exit(1);
}

