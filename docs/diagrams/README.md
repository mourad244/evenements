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

## Nommage recommande

- `architecture_global.drawio`
- `flow_event_publication.png`
- `flow_registration_waitlist.svg`
- `flow_ticketing_notifications.png`
- `modules_frontend_event_platform.drawio`
- `security_gateway_roles.svg`

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
