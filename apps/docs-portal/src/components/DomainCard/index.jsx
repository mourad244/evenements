import React from "react";
import Link from "@docusaurus/Link";

import PhaseBadge from "../PhaseBadge";
import StatusBadge from "../StatusBadge";

export default function DomainCard({ title, description, phase, status, tags = [], to, meta }) {
  return (
    <Link className="portal-card portal-card--domain" to={to}>
      <div className="portal-card__topline">
        <div className="portal-card__badges">
          <PhaseBadge phase={phase} />
          <StatusBadge status={status} />
        </div>
        {meta ? <span className="portal-card__meta">{meta}</span> : null}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {tags.length > 0 ? (
        <div className="portal-chip-row">
          {tags.map((tag) => (
            <span className="portal-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
