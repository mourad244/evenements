# Repartition des taches - Mourad & Ibrahim

Repartition initiale de travail pour une equipe de 2 personnes.

## Equipe

- **Mourad**: lead architecture, backend, contrats API, integration
  inter-services, securite, observabilite, documentation technique.
- **Ibrahim**: lead frontend, UX/UI, parcours utilisateur, integration
  frontend-backend, shells applicatifs, recette visuelle.

## Principes de travail

- Chaque tache a un `Owner` principal et un `Support`.
- `Owner` = responsable de l'avancement et de l'integration finale.
- `Support` = relecture, integration croisee, aide sur les blocs
  dependants.
- Les interfaces front/back sont definies ensemble avant implementation.
- Aucun des deux ne travaille directement sur `main`; tout passe par
  branche + PR.

## Repartition par domaine

| Domaine | Lead | Support | Notes |
| --- | --- | --- | --- |
| Architecture globale & docs | Mourad | Ibrahim | Decoupage des services, backlog, roadmap, contrats |
| Identity & Access | Mourad | Ibrahim | Backend auth + integration UI login/session |
| Event Management | Mourad | Ibrahim | Backend evenement + back-office organisateur |
| Catalog & Search | Mourad | Ibrahim | Index/search backend + portail public |
| Registration & Ticketing | Mourad | Ibrahim | Regles metier, concurrence, billets |
| Notification | Mourad | Ibrahim | Pipeline async + branchement UI statut |
| Frontend transverse | Ibrahim | Mourad | Portail public, espace participant, back-office, admin shell |
| Admin & Moderation | Mourad + Ibrahim | - | Mourad lead API/audit, Ibrahim lead console/KPI |
| Payment | Mourad | Ibrahim | Backend paiement, webhooks, ecrans statut |
| Diagrammes & recette visuelle | Ibrahim | Mourad | Flows, wireframes, coherence parcours |

## Repartition par sprint

### Sprint 0 - Fondations

- Mourad:
  - valider la topologie microservices
  - remplir les specs backend MVP
  - definir les contrats auth, event, catalog, registration
  - cadrer logs, correlation-id et securite
- Ibrahim:
  - definir la structure frontend cible
  - preparer les shells `public-portal`, `organizer-backoffice`,
    `admin-console`
  - produire les diagrammes des 3 flux critiques
  - challenger les payloads backend du point de vue UI

### Sprint 1 - MVP publication & inscription

- Mourad:
  - Identity & Access backend
  - Event Management backend
  - Catalog/Search backend
  - Registration backend
- Ibrahim:
  - portail public
  - parcours login/inscription
  - back-office organisateur
  - dashboard participant MVP

### Sprint 2 - Ticketing & notifications

- Mourad:
  - Ticketing backend
  - Notification backend
  - export des inscrits
- Ibrahim:
  - telechargement billet
  - affichage statuts notification/ticket
  - vues organisateur associees

### Sprint 3 - Admin & moderation

- Mourad:
  - API moderation
  - audit et recherche backend
  - exposition KPI
- Ibrahim:
  - console admin
  - file moderation
  - dashboards et vues de recherche

### Sprint 4 - Payment & extensions

- Mourad:
  - integration provider
  - webhooks et statuts de transaction
  - alignement paiement/registration/ticket
- Ibrahim:
  - checkout UI
  - affichage statut paiement
  - vues organisateur encaissements

## Workflow Git a 2

1. Creer une branche par tache:
   - `feature/auth-login`
   - `feature/public-catalog`
   - `docs/api-contracts-registration`
2. Pousser la branche et ouvrir une PR.
3. L'autre personne relit avant merge.
4. Fusionner dans `main` uniquement via PR.

## Priorite immediate

1. Mourad: specs des 4 services P1.
2. Ibrahim: structure frontend cible + diagrammes des flux MVP.
3. Ensemble: valider les contrats front/back avant de commencer le code.
