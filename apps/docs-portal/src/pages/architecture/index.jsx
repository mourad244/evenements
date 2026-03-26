import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import DiagramPanel from "../../components/DiagramPanel";
import SectionHub from "../../components/SectionHub";
import { architectureDiagrams } from "../../data/portalData";

export default function ArchitecturePage() {
  return (
    <Layout title="Architecture" description="Diagrammes et lecture des flux du projet.">
      <main className="portal-shell portal-shell--narrow">
        <SectionHub
          eyebrow="Architecture"
          title="Vue systeme et flux critiques"
          description="Cette section regroupe les diagrammes Mermaid rendus inline pour lire rapidement la topologie, la publication evenement et la gestion de la waitlist."
          actions={[
            <Link className="portal-chip portal-chip--action" key="scope" to="/reference/mvp-scope">
              MVP scope
            </Link>,
            <Link className="portal-chip portal-chip--action" key="reference" to="/reference/diagrams/readme">
              Diagrammes sources
            </Link>
          ]}
        >
          <div className="portal-stack">
            {architectureDiagrams.map((diagram) => (
              <DiagramPanel key={diagram.title} {...diagram} />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
