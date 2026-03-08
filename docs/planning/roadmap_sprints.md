# Roadmap - Phases & Sprints du Projet Evenements

Synthese des jalons de delivery proposes a partir du cahier des charges.
Les dates ci-dessous sont indicatives au 2026-03-07 et doivent etre
recalibrees apres estimation equipe.

## Vue d'ensemble

- Phase 0 - Fondations architecture: `PLANNED`
- Phase 1 - MVP publication & inscription: `PLANNED`
- Phase 2 - Ticketing & notifications: `PLANNED`
- Phase 3 - Administration & moderation: `PLANNED`
- Phase 4 - Paiement & extensions: `PLANNED`
- Phase 5 - Industrialisation & observabilite avancee: `PLANNED`

## Detail par phase

| Phase | Sprint cible | Fenetre indicative | Objectif principal | Resultat attendu | Docs associes |
| --- | --- | --- | --- | --- | --- |
| 0 | S0 | 2026-03-09 -> 2026-03-20 | Fixer les contrats, la topologie des services, la securite transverse et le backlog executable | Architecture validee, services cibles nommes, conventions backend/frontend, baseline documentaire prete | `docs/sprints/sprint_0_architecture_foundation.md` |
| 1 | S1 | 2026-03-23 -> 2026-04-10 | Livrer le MVP P1: auth, gestion evenement, catalogue, inscription, liste d'attente, espace personnel | Organisateur publie, participant consulte et s'inscrit, capacite et attente fonctionnent | `docs/sprints/sprint_1_mvp_event_publication_registration.md` |
| 2 | S2 | 2026-04-13 -> 2026-05-01 | Ajouter billet electronique, QR code, export et notifications | Ticket PDF/PNG genere, rappels email, historique des envois, export des inscrits | `docs/sprints/sprint_2_ticketing_notifications.md` |
| 3 | S3 | 2026-05-04 -> 2026-05-22 | Industrialiser moderation, audit et supervision metier | Console admin utilisable, moderation, recherche globale, audit et dashboards initiaux | `docs/sprints/sprint_3_admin_moderation.md` |
| 4 | S4 | 2026-05-25 -> 2026-06-12 | Ouvrir le lot optionnel paiement et les extensions de monetisation | Paiement pour evenements payants, statuts de transaction, webhooks, garde-fous metier | `docs/sprints/sprint_4_payment_extensions.md` |
| 5 | S5 | 2026-06-15 -> 2026-07-03 | Renforcer observabilite, CI/CD, securite et readiness production | SLO, dashboards ops, traces distribuees, pipeline qualite et runbooks | backlog monitoring + releases |

## Hypotheses de sequencing

- S0 verrouille le decoupage, sinon les sprints suivants risquent un
  couplage excessif.
- S1 couvre la valeur utilisateur minimale et les criteres de recette
  prioritaires du PDF.
- S2 prend les traitements derives et asynchrones qui transforment
  l'inscription en parcours complet.
- S3 ajoute la gouvernance et la supervision.
- S4 reste optionnel si les evenements payants ne sont pas prioritaires.

## Prochaines actions recommandees

1. Valider les noms definitifs des microservices et leurs frontieres.
2. Transformer chaque backlog de domaine en tickets techniques
   backend/frontend/ops.
3. Dessiner les diagrammes macro et les 3 flux critiques:
   publication, inscription, promotion de liste d'attente.
4. Verrouiller les contrats de securite et de messages avant S1.

## Repartition equipe initiale

- Mourad:
  - architecture microservices
  - backend des services P1/P2
  - contrats API et evenements
  - securite, observabilite, documentation technique
- Ibrahim:
  - shells frontend
  - portail public, espace participant, back-office organisateur, console admin
  - integration frontend-backend
  - diagrammes et coherence UX

Reference detaillee: `docs/planning/team_work_split.md`.
