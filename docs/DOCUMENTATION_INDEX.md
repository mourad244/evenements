# Index de Documentation - Projet Evenements

> Public cible: produit, architecte, dev backend, dev frontend, ops  
> Derniere mise a jour: 2026-03-07

## Demarrage rapide

- [Guide de demarrage rapide](./QUICK_START.md)
- [Perimetre MVP et architecture cible](./mvp_scope.md)
- [Roadmap des sprints](./planning/roadmap_sprints.md)
- [Cahier des charges PDF](./cahier_des_charges_evenements_microservices.pdf)

## Architecture et delivery

- [README documentation](./README.md)
- [Release plan](./planning/release_plan.md)
- [Diagrammes attendus](./diagrams/README.md)
- [Workflow backend](./workflows/Workflow_backend.md)
- [Workflow frontend](./workflows/Workflow_frontend.md)
- [Workflow backend domaine evenement](./workflows/Workflow_backend_event_domain.md)
- [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md)
- [Template de spec backend](./templates/TemplateBackendServiceSpec.md)

## Backlogs par domaine

- [BackLog Identity & Access](./backlogs/BackLog_identity_access.md)
- [BackLog Event Management](./backlogs/BackLog_event_management.md)
- [BackLog Registration & Ticketing](./backlogs/BackLog_registration_ticketing.md)
- [BackLog Notification](./backlogs/BackLog_notification.md)
- [BackLog Admin & Moderation](./backlogs/BackLog_admin_moderation.md)
- [BackLog Payment](./backlogs/BackLog_payment.md)
- [BackLog Frontend](./backlogs/BackLog_frontend.md)
- [BackLog Monitoring](./backlogs/BackLog_monitoring.md)
- [BackLog Documentation](./backlogs/BackLog_documentation.md)

## Planning et suivi

- [User stories consolidees](./user_stories/user_stories_table.md)
- [Sprint 0 - Fondations architecture](./sprints/sprint_0_architecture_foundation.md)
- [Sprint 1 - MVP publication & inscription](./sprints/sprint_1_mvp_event_publication_registration.md)
- [Sprint 2 - Ticketing & notifications](./sprints/sprint_2_ticketing_notifications.md)
- [Sprint 3 - Administration & moderation](./sprints/sprint_3_admin_moderation.md)
- [Sprint 4 - Paiement & extensions](./sprints/sprint_4_payment_extensions.md)
- [Historique des livrables](./task_history.md)

## Exploitation optionnelle

- [Template de release](./releases/release_TEMPLATE.md)

Note: cette section reste inactive tant qu'il n'y a pas de version
deployable.

## Innovation et cadrage futur

- [Idees produit et techniques](./ideas/README.md)

## Navigation par besoin

- Comprendre le produit -> [mvp_scope.md](./mvp_scope.md)
- Prioriser le MVP -> [user_stories_table.md](./user_stories/user_stories_table.md)
- Planifier un increment -> [roadmap_sprints.md](./planning/roadmap_sprints.md)
- Decouper un microservice -> [TemplateBackendServiceSpec.md](./templates/TemplateBackendServiceSpec.md)
- Definir les conventions back -> [Workflow_backend.md](./workflows/Workflow_backend.md)
- Definir les conventions front -> [Workflow_frontend.md](./workflows/Workflow_frontend.md)
- Trier une idee -> [ideas/README.md](./ideas/README.md)

## Notes

- Le depot ne contient pas encore la base de code d'execution.
- Les documents de ce dossier sont donc des references de cadrage et de
  pilotage, a convertir ensuite en implementation dans les futurs dossiers
  `services/`, `frontend/`, `infra/` et `shared/`.
- Il n'est donc pas necessaire, pour l'instant, de maintenir des notes de
  release ou un suivi "changes since last push".
