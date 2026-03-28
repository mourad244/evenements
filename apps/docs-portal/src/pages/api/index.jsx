import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import ApiRouteCard from "../../components/ApiRouteCard";
import SectionHub from "../../components/SectionHub";
import { apiCollections } from "../../data/portalData";

export default function ApiPage() {
  return (
    <Layout title="API" description="Catalogue visuel des routes MVP via Gateway.">
      <main className="portal-shell portal-shell--narrow">
        <SectionHub
          eyebrow="API"
          title="Catalogue visuel des endpoints MVP"
          description="Lecture orientee delivery pour voir rapidement methode, route, auth, acteur et usage. La spec detaillee reste la source canonique."
          actions={[
            <Link className="portal-chip portal-chip--action" key="contracts" to="/reference/api-contracts-p1">
              Spec complete
            </Link>,
            <Link className="portal-chip portal-chip--action" key="async" to="/reference/async-events-p1">
              Evenements async
            </Link>
          ]}
        >
          <div className="portal-stack">
            {apiCollections.map((group) => (
              <section className="portal-card portal-card--group" key={group.title}>
                <div className="portal-card__topline">
                  <span className="portal-card__eyebrow">Domaine API</span>
                </div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
                <div className="portal-grid portal-grid--api">
                  {group.routes.map((route) => (
                    <ApiRouteCard key={`${route.method}-${route.route}`} {...route} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
