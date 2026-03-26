import React from "react";

import PhaseBadge from "../PhaseBadge";
import StatusBadge from "../StatusBadge";

export default function DocMetaHeader({ title, description, frontMatter = {}, compact = false }) {
  const tags = Array.isArray(frontMatter.tags) ? frontMatter.tags : [];

  return (
    <div className={`portal-doc-header${compact ? " portal-doc-header--compact" : ""}`}>
      <div className="portal-doc-header__content">
        {frontMatter.docKind ? (
          <span className="portal-section__eyebrow">{frontMatter.docKind}</span>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>

      <div className="portal-doc-header__meta">
        <div className="portal-card__badges">
          <PhaseBadge phase={frontMatter.phase} />
          <StatusBadge status={frontMatter.status} />
          {frontMatter.priority ? (
            <span className="portal-badge portal-badge--priority">{frontMatter.priority}</span>
          ) : null}
          {frontMatter.domain ? (
            <span className="portal-badge portal-badge--domain">{frontMatter.domain}</span>
          ) : null}
        </div>
        {frontMatter.owner ? (
          <div className="portal-card__meta">Owner: {frontMatter.owner}</div>
        ) : null}
        {tags.length > 0 ? (
          <div className="portal-chip-row">
            {tags.map((tag) => (
              <span className="portal-chip" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
