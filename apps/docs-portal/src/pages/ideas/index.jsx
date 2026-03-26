import React from "react";
import Layout from "@theme/Layout";

import DomainCard from "../../components/DomainCard";
import SectionHub from "../../components/SectionHub";
import { ideasDocs } from "../../data/portalData";

export default function IdeasPage() {
  return (
    <Layout title="Ideas" description="Parking lot des idees produit et techniques.">
      <main className="portal-shell">
        <SectionHub
          eyebrow="Ideas"
          title="Parking lot produit et technique"
          description="Les idees restent visibles ici avant d'etre transformees en backlog ou en sprint."
        >
          <div className="portal-grid portal-grid--domains">
            {ideasDocs.map((item) => (
              <DomainCard
                key={item.title}
                title={item.title}
                description={item.description}
                to={item.to}
                status={item.status}
                tags={["ideas", "future"]}
              />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
