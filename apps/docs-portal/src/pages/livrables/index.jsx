import React from "react";
import Layout from "@theme/Layout";

import DomainCard from "../../components/DomainCard";
import SectionHub from "../../components/SectionHub";
import { deliverableDocs } from "../../data/portalData";

export default function DeliverablesPage() {
  return (
    <Layout
      title="Livrables"
      description="Lecture du sujet Evenements par livrables, alignee sur le HTML de reference."
    >
      <main className="portal-shell">
        <SectionHub
          eyebrow="Livrables"
          title="Lecture alignee sur le HTML du sujet Evenements"
          description="Le HTML externe structure le sujet par base de donnees, UI, backlog, architecture, API, application, securite, guide dev et tests. Ce hub renvoie vers les sources canoniques du repo pour chacune de ces attentes."
        >
          <div className="portal-grid portal-grid--domains">
            {deliverableDocs.map((item) => (
              <DomainCard key={item.title} {...item} />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
