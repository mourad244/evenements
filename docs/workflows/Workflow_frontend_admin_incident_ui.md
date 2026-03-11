# Workflow frontend - Admin incident UI (Sprint 3)

Ce document decrit l'integration UI de la vue incident admin
(ticket `A06.3`) sur `/admin/incidents`.

## 1. Objectif

- Afficher une chronologie inter-services lisible pour investigation.
- Permettre la recherche par `correlationId` et filtres d'incident.
- Aligner la UI avec `A06.1` et le backend `A06.2`.

## 2. Dependances

- `A01.2`: shell admin
- `A01.3`: guard admin route
- `A06.1`: contrat incident trace
- `A06.2`: backend `admin-incident-trace-service`

## 3. Routing et acces

- liste incidents: `/admin/incidents`
- detail incident: `/admin/incidents/:incidentId`
- acces direct correlation id (query): `/admin/incidents?correlationId=...`

Guard:

- `useAdminGuard()` obligatoire
- non-auth -> redirect login avec `next`
- non-admin -> `StateForbidden`

## 4. Structure de page

Composants:

- `IncidentFiltersBar`
- `IncidentTraceTable`
- `IncidentPagination`
- `IncidentDetailPanel`
- `IncidentTimeline`

Etats UI:

- `StateLoading` pendant fetch
- `StateEmpty` si aucune trace
- `StateError` si erreur API
- `StateForbidden` si acces refuse

## 5. Filtres exposes

Filtres minimaux:

- `correlationId`
- `severity`
- `status`
- `primaryDomain`
- `from`, `to`

Regles UX:

- bouton `Search`
- bouton `Reset`
- persistance dans query string
- `page` reset a `1` sur changement filtre

## 6. Mapping API frontend

Listage:

- `GET /api/admin/incidents/traces`

Detail:

- `GET /api/admin/incidents/traces/{incidentId}`

Lookup correlation:

- `GET /api/admin/incidents/traces/by-correlation/{correlationId}`

Payload detail attendu:

- `{ incident, steps }`

## 7. Table incidents

Colonnes minimales:

- `incidentId`
- `correlationId`
- `severity`
- `status`
- `primaryDomain`
- `startedAt`
- `endedAt`
- `summary`
- action `View timeline`

Actions:

- click ligne ouvre `IncidentDetailPanel`
- `View timeline` scrolle/focus la timeline

## 8. Timeline incident

Chaque step affiche:

- `timestamp`
- `sourceType`
- `sourceService`
- `action`
- `targetType` / `targetId`
- `result`
- `message`
- `httpStatus` / `errorCode` si presents

Regles:

- tri ascendant par `timestamp`
- `result=FAILURE|UNKNOWN` mis en evidence
- `correlationId` visible en en-tete detail

## 9. Gestion erreurs

- `400`: filtre invalide -> message validation
- `401`: redirect login
- `403`: `StateForbidden`
- `404` detail -> "Incident introuvable"
- `5xx`: `StateError` + `correlationId` si present

## 10. Observabilite frontend

Events UI:

- `admin.incident.search.requested`
- `admin.incident.search.succeeded`
- `admin.incident.search.failed`
- `admin.incident.detail.opened`

Payload minimal:

- `correlationId`
- `filtersHash`
- `resultsCount`
- `stepsCount` (detail)

## 11. Tests UI minimaux

- guard admin sur `/admin/incidents`
- recherche par `correlationId` appelle la bonne route
- ouverture detail affiche timeline ordonnee
- rendu visuel des steps `FAILURE|UNKNOWN`
- erreur `403` -> `StateForbidden`
- erreur `404` detail -> message explicite
