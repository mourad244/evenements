import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

import DomainCard from "../components/DomainCard";
import QuickLinkGrid from "../components/QuickLinkGrid";
import SectionHub from "../components/SectionHub";
import { domainCards, projectStatus, quickLinks } from "../data/portalData";

export default function HomePage() {
  return (
    <Layout
      title="Accueil"
      description="Portail graphique de la documentation Evenements microservices."
    >
      <main className="portal-shell">
        <section className="portal-hero">
          <div className="portal-hero__content">
            <span className="portal-section__eyebrow">Developer portal</span>
            <h1>Documentation Evenements en mode portal visuel</h1>
            <p>
              Une entree unique pour l&apos;architecture, les contrats API, les backlogs,
              les sprints, les specs services et les workflows du projet microservices
              Evenements.
            </p>
            <div className="portal-hero__actions">
              <Link className="button button--primary button--lg" to="/architecture">
                Explorer l&apos;architecture
              </Link>
              <Link className="button button--secondary button--lg" to="/reference/navigation">
                Ouvrir la reference
              </Link>
            </div>
          </div>
          <div className="portal-hero__status">
            {projectStatus.map((item) => (
              <div className="portal-status-card" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionHub
          eyebrow="Navigation rapide"
          title="Les points d&apos;entree les plus utiles"
          description="Les pages hub donnent une lecture plus graphique; la reference garde tout le detail source."
        >
          <QuickLinkGrid items={quickLinks} />
        </SectionHub>

        <SectionHub
          eyebrow="Domaines"
          title="Carte rapide du programme"
          description="Chaque domaine renvoie vers son backlog, avec lecture rapide du niveau de maturite actuel."
          actions={[
            <Link className="portal-chip portal-chip--action" key="backlogs" to="/backlogs">
              Voir tous les backlogs
            </Link>,
            <Link className="portal-chip portal-chip--action" key="services" to="/services">
              Voir les specs services
            </Link>
          ]}
        >
          <div className="portal-grid portal-grid--domains">
            {domainCards.map((item) => (
              <DomainCard key={item.title} {...item} />
            ))}
          </div>
        </SectionHub>
      </main>
    </Layout>
  );
}
