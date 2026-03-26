import React from "react";
import Layout from "@theme/Layout";

import DomainCard from "../../components/DomainCard";
import SectionHub from "../../components/SectionHub";
import { serviceDocs } from "../../data/portalData";

export default function ServicesPage() {
  return (
    <Layout title="Services" description="Catalogue des specs backend par microservice.">
      <main className="portal-shell">
        <SectionHub
          eyebrow="Services"
          title="Specifications backend"
          description="Lecture rapide des owners metier et interfaces majeures avant implementation."
        >
          <div className="portal-grid portal-grid--domains">
            {serviceDocs.map((item) => (
              <DomainCard
                key={item.title}
                title={item.title}
                description={item.description}
                to={item.to}
                phase={item.phase}
                status={item.status}
                tags={["spec"]}
              />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
