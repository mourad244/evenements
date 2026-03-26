import React from "react";
import Link from "@docusaurus/Link";

export default function QuickLinkGrid({ items }) {
  return (
    <div className="portal-grid portal-grid--quicklinks">
      {items.map((item) => (
        <Link className="portal-card portal-card--quicklink" key={item.to} to={item.to}>
          <span className="portal-card__eyebrow">Acces rapide</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </Link>
      ))}
    </div>
  );
}
