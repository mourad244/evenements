import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import PhaseBadge from "../../components/PhaseBadge";
import SectionHub from "../../components/SectionHub";
import StatusBadge from "../../components/StatusBadge";
import { sprintDocs } from "../../data/portalData";

export default function SprintsPage() {
  return (
    <Layout title="Sprints" description="Vue synthese du delivery multi-sprints.">
      <main className="portal-shell portal-shell--narrow">
        <SectionHub
          eyebrow="Sprints"
          title="Roadmap timeboxee"
          description="Timeline simplifiee pour parcourir Sprint 0 a Sprint 4, plus le tracker d'execution Sprint 1."
        >
          <div className="portal-timeline">
            {sprintDocs.map((item) => (
              <Link className="portal-card portal-card--timeline" key={item.title} to={item.to}>
                <div className="portal-card__topline">
                  <div className="portal-card__badges">
                    <PhaseBadge phase={item.phase} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
