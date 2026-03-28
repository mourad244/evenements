import React from "react";

export default function SectionHub({ eyebrow, title, description, actions, children }) {
  return (
    <section className="portal-section">
      <div className="portal-section__header">
        {eyebrow ? <span className="portal-section__eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
        {actions ? <div className="portal-chip-row">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
