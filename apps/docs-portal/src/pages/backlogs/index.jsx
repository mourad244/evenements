import React from "react";
import Layout from "@theme/Layout";

import DomainCard from "../../components/DomainCard";
import SectionHub from "../../components/SectionHub";
import { backlogDocs } from "../../data/portalData";

export default function BacklogsPage() {
  return (
    <Layout title="Backlogs" description="Lecture graphique des backlogs par domaine.">
      <main className="portal-shell">
        <SectionHub
          eyebrow="Backlogs"
          title="Travaux par domaine"
          description="Chaque backlog garde la source detaillee; cette vue sert a piloter domaine, owner, priorite et statut global."
        >
          <div className="portal-grid portal-grid--domains">
            {backlogDocs.map((item) => (
              <DomainCard
                key={item.title}
                title={item.title}
                description={item.description}
                to={item.to}
                status={item.status}
                meta={`${item.owner} · ${item.priority}`}
                tags={["backlog"]}
              />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
