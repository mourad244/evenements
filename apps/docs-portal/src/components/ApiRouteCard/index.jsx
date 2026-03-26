import React from "react";

const METHOD_CLASS = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  PUT: "put",
  DELETE: "delete"
};

export default function ApiRouteCard({ method, route, auth, actor, usage }) {
  const normalizedMethod = String(method).toUpperCase();
  return (
    <div className="portal-card portal-card--api">
      <div className="portal-card__topline">
        <span className={`portal-method portal-method--${METHOD_CLASS[normalizedMethod] || "default"}`}>
          {normalizedMethod}
        </span>
        <span className="portal-card__meta">{auth}</span>
      </div>
      <h3>{route}</h3>
      <p>{usage}</p>
      <div className="portal-chip-row">
        <span className="portal-chip">Acteur: {actor}</span>
      </div>
    </div>
  );
}
