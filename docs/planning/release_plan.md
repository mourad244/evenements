# Release Plan - Projet Evenements

Plan directeur des versions. Les dates cibles ci-dessous sont proposees au
2026-03-07 et devront etre ajustees apres estimation detaillee.

| Version | Contenu principal | Date cible | Criteres de readiness | Dependances clefs |
| --- | --- | --- | --- | --- |
| baseline-docs | Baseline documentaire, backlogs, roadmap, workflows, skill `.codex` adapte | 2026-03-07 | Documentation structuree, liens verifiables, scope P1->P4 formalise | Cahier des charges PDF |
| v0.1-architecture | Topologie microservices, contrats initiaux, modeles de donnees de haut niveau, conventions de dev | 2026-03-20 | Spec de services validees, diagrammes macro, choix sync/async confirms | Sprint 0 |
| v0.2-mvp | Auth, publication evenement, catalogue public, inscription, waitlist, espace participant | 2026-04-10 | Publication et inscription bout en bout, roles appliques, tests smoke MVP | Identity, Event Management, Catalog, Registration |
| v0.3-ticketing | Billet electronique, QR code, export inscrits, notifications email, journal d'envoi | 2026-05-01 | Billets generes sans doublon, rappels envoyes, logs de notification exploitables | Ticketing, Notification, Media |
| v0.4-admin | Moderation, audit, tableaux de bord, recherche globale admin | 2026-05-22 | Console admin operationnelle, traces d'audit consultables, incidents retraçables | Admin & Moderation, Observabilite |
| v1.0-payment | Paiement des evenements payants, webhooks, statuts de transaction, controles de coherence | 2026-06-12 | Paiement confirme avant emission si requis, erreurs gerees, reprise et reconciliation documentees | Payment, Registration, Ticketing |
| v1.1-prod-ready | Observabilite avancee, CI/CD, durcissement securite, runbooks | 2026-07-03 | Dashboards, alertes, traces distribuees, politique de rollback et de sauvegarde | Monitoring, Infra, Security |
| v1.2-experience-closure | Integration UI finale participant/organisateur/admin, fermeture des tickets `PARTIAL`, panels ops relies aux metriques existantes | 2026-07-24 | Telechargement billet et export branches dans les vues, statuts notification visibles, panels ops/admin exploitables, passe a11y minimale executee | Frontend, Admin, Monitoring, Registration, Notification |

## Rappels

- Toute release doit pointer vers un sprint et des backlogs de domaine.
- Les criteres de readiness doivent inclure securite, observabilite et
  testabilite, pas seulement la fonctionnalite.
- Si le scope glisse, corriger la date cible et tracer l'ecart dans
  `docs/task_history.md`.
