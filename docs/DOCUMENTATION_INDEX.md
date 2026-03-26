---
title: Index de documentation
description: Navigation rapide vers tous les documents structurants du projet Evenements.
docKind: index
domain: documentation
phase: P0-P4
owner: Mourad
status: DONE
tags:
  - navigation
  - docs
  - portal
slug: navigation
---

# Index de Documentation - Projet Evenements

> Public cible: produit, architecte, dev backend, dev frontend, ops  
> Derniere mise a jour: 2026-03-08

## Demarrage rapide

- [Guide de demarrage rapide](./QUICK_START.md)
- [Perimetre MVP et architecture cible](/reference/mvp-scope)
- [Roadmap des sprints](./planning/roadmap_sprints.md)
- [Cahier des charges PDF](./cahier_des_charges_evenements_microservices.pdf)

## Architecture et delivery

- [README documentation](./README.md)
- [Release plan](./planning/release_plan.md)
- [Diagrammes attendus](/reference/diagrams/readme)
- [Diagramme architecture globale](/reference/diagrams/architecture-global)
- [Diagramme publication evenement](/reference/diagrams/event-publication-flow)
- [Diagramme inscription waitlist](/reference/diagrams/registration-waitlist-flow)
- [Dictionnaire de donnees P1](./data-dictionary-p1.md)
- [Catalogue REST P1](./api-contracts-p1.md)
- [Catalogue d'evenements async P1](./async-events-p1.md)
- [Plan de smoke tests MVP](./test-plan-smoke-mvp.md)
- [Plan de recette par phase](./test-plan-acceptance-matrix.md)
- [Plan de non-regression ACL](./test-plan-role-regression.md)
- [Spec identity-access-service](/reference/services/identity-access-service)
- [Spec event-management-service](/reference/services/event-management-service)
- [Spec catalog-search-service](/reference/services/catalog-search-service)
- [Spec registration-service](/reference/services/registration-service)
- [Workflow backend](/reference/workflows/backend)
- [Workflow frontend](/reference/workflows/frontend)
- [Workflow backend domaine evenement](/reference/workflows/backend-event-domain)
- [Workflow frontend portail evenement](/reference/workflows/frontend-event-portal)
- [Template de spec backend](./templates/TemplateBackendServiceSpec.md)

## Backlogs par domaine

- [BackLog Identity & Access](/reference/backlogs/identity-access)
- [BackLog Event Management](/reference/backlogs/event-management)
- [BackLog Registration & Ticketing](/reference/backlogs/registration-ticketing)
- [BackLog Notification](/reference/backlogs/notification)
- [BackLog Admin & Moderation](/reference/backlogs/admin-moderation)
- [BackLog Payment](/reference/backlogs/payment)
- [BackLog Frontend](/reference/backlogs/frontend)
- [BackLog Monitoring](/reference/backlogs/monitoring)
- [BackLog Documentation](./backlogs/BackLog_documentation.md)

## Planning et suivi

- [User stories consolidees](./user_stories/user_stories_table.md)
- [Repartition des taches Mourad / Ibrahim](./planning/team_work_split.md)
- [Sprint 0 - Fondations architecture](/reference/sprints/sprint-0-architecture-foundation)
- [Sprint 1 - MVP publication & inscription](/reference/sprints/sprint-1-mvp)
- [Sprint 2 - Ticketing & notifications](/reference/sprints/sprint-2-ticketing-notifications)
- [Sprint 3 - Administration & moderation](/reference/sprints/sprint-3-admin-moderation)
- [Sprint 4 - Paiement & extensions](/reference/sprints/sprint-4-payment-extensions)
- [Historique des livrables](./task_history.md)

## Exploitation optionnelle

- [Template de release](./releases/release_TEMPLATE.md)

Note: cette section reste inactive tant qu'il n'y a pas de version
deployable.

## Innovation et cadrage futur

- [Idees produit et techniques](/reference/ideas/ideas)

## Navigation par besoin

- Comprendre le produit -> [mvp_scope.md](/reference/mvp-scope)
- Prioriser le MVP -> [user_stories_table.md](./user_stories/user_stories_table.md)
- Planifier un increment -> [roadmap_sprints.md](./planning/roadmap_sprints.md)
- Decouper un microservice -> [TemplateBackendServiceSpec.md](./templates/TemplateBackendServiceSpec.md)
- Definir les conventions back -> [Workflow_backend.md](/reference/workflows/backend)
- Definir les conventions front -> [Workflow_frontend.md](/reference/workflows/frontend)
- Trier une idee -> [ideas/README.md](/reference/ideas/ideas)

## Notes

- Le depot ne contient pas encore la base de code d'execution.
- Les documents de ce dossier sont donc des references de cadrage et de
  pilotage, a convertir ensuite en implementation dans les futurs dossiers
  `services/`, `frontend/`, `infra/` et `shared/`.
- Il n'est donc pas necessaire, pour l'instant, de maintenir des notes de
  release ou un suivi "changes since last push".
