# Schemas & Diagrammes - Projet Evenements

Ce dossier doit centraliser les representations visuelles qui completent
le cadrage fonctionnel et technique.

## Perimetre

- Schema macro d'architecture microservices.
- Flux de publication d'un evenement.
- Flux d'inscription standard.
- Flux de gestion de liste d'attente et promotion.
- Flux ticketing + notification.
- Vue des interfaces frontend:
  portail public, espace participant, back-office organisateur, console admin.

## Sources disponibles

- [architecture_global.mmd](./architecture_global.mmd)
- [flow_event_publication.mmd](./flow_event_publication.mmd)
- [flow_registration_waitlist.mmd](./flow_registration_waitlist.mmd)

Ces sources Mermaid couvrent le minimum demande pour la sortie de
`Sprint 0`. Des exports PNG/SVG pourront etre generes plus tard si
necessaire pour des supports externes.

## Convention de format

- format source prefere ici: `.mmd` Mermaid
- un export image peut etre ajoute ensuite sans supprimer la source
- fleche pleine = flux synchrone
- fleche en pointille = flux asynchrone / event bus

## Nommage recommande pour les prochains diagrammes

- `flow_ticketing_notifications.mmd`
- `modules_frontend_event_platform.mmd`
- `security_gateway_roles.mmd`

## Sources a aligner

- `docs/mvp_scope.md`
- `docs/planning/roadmap_sprints.md`
- `docs/user_stories/user_stories_table.md`
- `docs/workflows/Workflow_backend.md`
- `docs/workflows/Workflow_frontend.md`

## Attendus de qualite

- Chaque diagramme doit avoir une source modifiable (`.drawio` ou equivalent).
- Chaque diagramme doit etre reference depuis un document de contexte.
- Les flux sync et async doivent etre distingues visuellement.
- Les responsabilites de service et les acteurs doivent etre lisibles.
