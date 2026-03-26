import React from "react";
import Link from "@docusaurus/Link";
import Mermaid from "@theme/Mermaid";

export default function DiagramPanel({ title, description, mermaid, to }) {
  return (
    <div className="portal-card portal-card--diagram">
      <div className="portal-card__topline">
        <span className="portal-card__eyebrow">Diagramme</span>
        <Link className="portal-inline-link" to={to}>
          Ouvrir la fiche
        </Link>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="portal-diagram">
        <Mermaid value={mermaid} />
      </div>
    </div>
  );
}
