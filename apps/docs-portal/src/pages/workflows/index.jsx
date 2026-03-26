import React from "react";
import Layout from "@theme/Layout";

import DomainCard from "../../components/DomainCard";
import SectionHub from "../../components/SectionHub";
import { workflowDocs } from "../../data/portalData";

export default function WorkflowsPage() {
  return (
    <Layout title="Workflows" description="Conventions backend et frontend du delivery.">
      <main className="portal-shell">
        <SectionHub
          eyebrow="Workflows"
          title="Conventions et modes de delivery"
          description="Le hub workflows donne un acces rapide aux pratiques backend/frontend qui structurent les prochains increments."
        >
          <div className="portal-grid portal-grid--domains">
            {workflowDocs.map((item) => (
              <DomainCard
                key={item.title}
                title={item.title}
                description={item.description}
                to={item.to}
                tags={[`owner: ${item.owner}`]}
              />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
