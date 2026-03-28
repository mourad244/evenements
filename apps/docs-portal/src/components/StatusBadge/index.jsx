import React from "react";

const LABELS = {
  TODO: "TODO",
  DONE: "DONE",
  IN_PROGRESS: "IN PROGRESS",
  PARTIAL: "PARTIAL",
  BLOCKED: "BLOCKED"
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = String(status).trim().toUpperCase();

  return (
    <span className={`portal-badge portal-badge--status portal-badge--${normalized.toLowerCase()}`}>
      {LABELS[normalized] || normalized}
    </span>
  );
}
