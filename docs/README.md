---
title: Documentation projet
description: Vue d'ensemble de la documentation Evenements microservices et de son organisation.
docKind: index
domain: documentation
phase: P0-P4
owner: Mourad
status: DONE
tags:
  - overview
  - docs
  - governance
slug: overview
---

# Documentation - Plateforme Evenements Microservices

## Objet

Donner une vue claire, a jour et actionnable du projet de gestion
d'evenements avec inscription en ligne, en s'appuyant sur le cahier des
charges `docs/cahier_des_charges_evenements_microservices.pdf`.

Le dossier `docs/` sert de source de verite pour:

- le cadrage fonctionnel;
- le decoupage microservices;
- l'alignement avec les livrables pedagogiques attendus;
- la planification MVP puis P2/P3/P4;
- les backlogs par domaine;
- les conventions de delivery, de tests et d'exploitation.

## Navigation par livrables HTML

Le livrable externe `livrables-techniques-sujets-fullstack.html`
attend, pour le sujet `Evenements`, une lecture par:

- base de donnees;
- maquettes UI;
- backlog;
- architecture;
- API docs;
- application;
- securite;
- guide dev;
- tests.

Pour retrouver cette meme lecture dans le repo:

- [Alignement HTML -> repo](./livrables-html-evenements.md)
- [Surfaces UI et application](./ui-application-surfaces-evenements.md)
- [Strategie securite](./security-strategy-evenements.md)
- [Guide developpeur](./developer-guide-evenements.md)
- [Strategie de tests](./testing-strategy-evenements.md)

## Principes

- La documentation suit le produit cible, pas un projet precedent.
- Un fichier = un objectif clair: vision, sprint, backlog, workflow.
- Les hypotheses sont explicites quand le code n'existe pas encore.
- Toute fonctionnalite retenue pour implementation doit etre tracee dans:
  `mvp_scope`, le backlog de domaine, puis le sprint cible.
- Les dossiers `docs/releases/` et `docs/deployments/` restent reserves
  pour plus tard, quand il y aura une baseline deployable.

## Organisation du dossier `docs/`

| Role                     | Fichier / dossier             | Contenu attendu                                                                                                    |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Guide d'entree           | `docs/README.md`              | Ce guide, logique documentaire, regles de mise a jour                                                              |
| Index global             | `docs/DOCUMENTATION_INDEX.md` | Navigation rapide par besoin                                                                                       |
| Demarrage projet         | `docs/QUICK_START.md`         | Parcours de prise en main du cadrage et du delivery                                                                |
| Gouvernance contribution | `docs/CONTRIBUTING.md`        | Workflow Git, regles de commit, Definition of Done doc                                                             |
| Vision & perimetre       | `docs/mvp_scope.md`           | Decoupage P1/P2/P3/P4, services, flux, hors perimetre                                                              |
| Backlogs                 | `docs/backlogs/`              | Travaux par domaine: auth, events, registration, notification, admin, payment, frontend, monitoring, documentation |
| Planification            | `docs/planning/`              | Roadmap des sprints et plan de release                                                                             |
| User stories             | `docs/user_stories/`          | Table consolidee des besoins et criteres d'acceptation                                                             |
| Execution par sprint     | `docs/sprints/`               | Objectifs, livrables cibles, risques et Done criteria                                                              |
| Specs de service         | `docs/services/`              | Specs backend detaillees par microservice avant implementation                                                     |
| Releases                 | `docs/releases/`              | Templates de release futurs, non alimentes pour l'instant                                                          |
| Exploitation             | `docs/deployments/`           | Support ops futur, non alimente tant qu'il n'y a pas de runtime                                                    |
| Workflows                | `docs/workflows/`             | Conventions backend/frontend et patterns de delivery                                                               |
| Templates                | `docs/templates/`             | Gabarits pour spec de service et cadrage technique                                                                 |
| Diagrammes               | `docs/diagrams/`              | Index des schemas attendus                                                                                         |
| Idees                    | `docs/ideas/`                 | Parking produit/tech/ops a trier vers backlog                                                                      |
| Historique               | `docs/task_history.md`        | Journal synthetique des livrables majeurs                                                                          |

## Mise a jour - checklist rapide

1. Nouvelle fonctionnalite retenue -> mettre a jour `docs/mvp_scope.md`.
2. Nouveau travail planifie -> ajouter une entree dans le backlog de domaine.
3. Sprint engage -> mettre a jour la fiche dans `docs/sprints/`.
4. Baseline technique deployable prete -> mettre a jour
   `docs/planning/release_plan.md` et, si necessaire, activer
   `docs/releases/`.
5. Changement d'architecture ou de flux -> documenter dans
   `docs/diagrams/README.md` et `docs/workflows/`.
6. Travail livre -> tracer dans `docs/task_history.md`.
7. Si la repartition equipe change -> mettre a jour
   `docs/planning/team_work_split.md`.

Tant qu'il n'y a pas de stack executable ou d'environnement cible, il
n'est pas necessaire d'alimenter `docs/deployments/` ni
`docs/releases/`.

## Clarifications clefs

- `mvp_scope.md` = la photo de reference du perimetre produit et
  technique vise.
- `docs/backlogs/` = la liste durable des travaux a faire, par domaine.
- `docs/sprints/` = la photo d'un increment temporel planifie ou livre.
- `docs/services/` = les specs backend detaillees qui traduisent les
  contrats en design implementable par service.
- `docs/releases/` = un support optionnel de notes de livraison futures.
- `docs/deployments/` = un support optionnel pour l'exploitation future.
- `docs/ideas/README.md` = les idees non encore transformees en backlog.

## Conventions de documentation

- Backlog: liste durable des travaux, independamment d'un sprint.
- Sprint: increment timeboxe avec objectif, livrables et risques.
- Release: note de livraison optionnelle quand une version deployable
  existe.
- Deployment tracking: checklist technique optionnelle quand un runtime
  existe.

## Roles et responsabilites

- Product/architecte: garde `mvp_scope.md` et la roadmap coherents.
- Equipe backend: tient les workflows et les specs de service a jour.
- Equipe frontend: tient les conventions UI, pages et ACL a jour.
- Equipe delivery/ops: maintient les checklists de deploiement et
  d'observabilite.

## Mode equipe a 2

La repartition courante de l'equipe est documentee dans
`docs/planning/team_work_split.md`.

- Mourad: lead architecture/backend/docs.
- Ibrahim: lead frontend/UX/integration.

Cette repartition sert a clarifier les owners des taches, pas a creer des
silos rigides.

## Etat actuel du depot

Au 2026-04-04, le depot contient:

- les services backend critiques du socle evenement;
- un frontend Next.js structure par routes et features;
- un portail docs Docusaurus;
- des suites de tests backend et frontend;
- la documentation canonique du scope, des contrats et des workflows.

Les fichiers de `docs/releases/` et `docs/deployments/` restent
secondaires tant qu'aucune baseline de deploiement n'est officiellement
ouverte.

**Derniere mise a jour:** 2026-04-04
**Version:** 0.3
