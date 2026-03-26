import React from "react";

export default function PhaseBadge({ phase }) {
  if (!phase) return null;
  return <span className="portal-badge portal-badge--phase">{phase}</span>;
}
