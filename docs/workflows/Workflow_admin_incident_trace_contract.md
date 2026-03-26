# Workflow admin - Incident trace contract (Sprint 3)

Ce document stabilise le contrat de chronologie d'incident admin
(ticket `A06.1`) pour relier audit, logs techniques et `correlationId`.

## 1. Objectif

- Definir un format unique de timeline d'incident inter-services.
- Permettre l'investigation bout en bout depuis la console admin.
- Standardiser les liens entre traces techniques et actions metier.

## 2. Perimetre

- Actor principal: `ADMIN`.
- Flux cibles MVP:
  publication evenement, inscription, promotion waitlist, notification.
- Hors-scope:
  root-cause automatique et remediation automatique.

## 3. Ownership et boundaries

- Source de verite consultation:
  `admin-incident-trace` (projection de lecture admin).
- Sources alimenteuses:
  `admin-audit-service` + logs techniques des services metier.
- Cle de jointure principale:
  `correlationId`.
- Jointures secondaires:
  `eventId`, `registrationId`, `notificationId`, `actorId`.

## 4. Entites contractuelles

### 4.1 `IncidentTrace`

Champs minimums:

- `incidentId` (string, unique)
- `correlationId` (string, obligatoire)
- `severity` (`LOW|MEDIUM|HIGH|CRITICAL`)
- `status` (`OPEN|INVESTIGATING|RESOLVED|CLOSED`)
- `startedAt` (ISO timestamp)
- `endedAt?` (ISO timestamp)
- `summary` (string)
- `primaryDomain` (`EVENT|REGISTRATION|NOTIFICATION|AUTH|SYSTEM`)

### 4.2 `IncidentTraceStep`

Champs minimums:

- `stepId` (string)
- `incidentId` (string)
- `timestamp` (ISO timestamp)
- `sourceType` (`AUDIT|SERVICE_LOG|ASYNC_EVENT|METRIC_ALERT`)
- `sourceService` (string)
- `action` (string)
- `targetType` (string)
- `targetId` (string)
- `result` (`SUCCESS|FAILURE|DENIED|UNKNOWN`)
- `message` (string court)
- `correlationId` (string)

Champs optionnels:

- `latencyMs`
- `httpStatus`
- `errorCode`
- `metadata` (redacted)

## 5. API contract minimal

### 5.1 `GET /api/admin/incidents/traces`

- Objectif:
  rechercher les incidents.
- Query:
  `correlationId?`, `severity?`, `status?`, `primaryDomain?`,
  `from?`, `to?`, `page`, `pageSize`, `sortBy?`, `sortOrder?`.
- Reponse:
  `{ success: true, data: IncidentTrace[], meta }`
- Erreurs:
  `400`, `401`, `403`.

### 5.2 `GET /api/admin/incidents/traces/{incidentId}`

- Objectif:
  consulter le detail d'incident + timeline.
- Reponse:
  `{ success: true, data: { incident, steps } }`
- Erreurs:
  `401`, `403`, `404`.

### 5.3 `GET /api/admin/incidents/traces/by-correlation/{correlationId}`

- Objectif:
  investiguer directement depuis un `correlationId`.
- Reponse:
  `{ success: true, data: { incident, steps } }`
- Erreurs:
  `401`, `403`, `404`.

Role requis sur toutes les routes:

- `ADMIN`.

## 6. Regles de chronologie

- Les `steps` sont tries par `timestamp` ascendant.
- Le meme `stepId` ne peut pas etre ingere deux fois (idempotence).
- Une trace sans `correlationId` n'est pas eligibile au mode incident.
- Si des donnees manquent pour un service, ajouter un step
  `sourceType=METRIC_ALERT` avec `result=UNKNOWN`.

## 7. Sources et synchronisation

- Source metier:
  `admin-audit-service` (actions metier sensibles).
- Source technique:
  logs structures services (`service`, `correlationId`, `errorCode`).
- Source async:
  events bus relies au `correlationId`.
- Mode ingestion:
  async + reindexation ponctuelle a la demande admin.

## 8. Securite et redaction

- Acces strictement `ADMIN`.
- Les `metadata` potentiellement sensibles sont redactees server-side.
- Aucun secret technique ne doit sortir en clair (tokens, passwords).

## 9. Observabilite

- Logs structures:
  `incidentId`, `correlationId`, `stepsCount`, `queryDurationMs`.
- Metriques:
  `incident_trace_queries_total`,
  `incident_trace_query_latency_ms`,
  `incident_trace_steps_per_incident`,
  `incident_trace_ingest_errors_total`.

## 10. Criteres d'acceptation

- Liens explicites entre `correlationId`, audit et logs techniques.
- Format `IncidentTrace`/`IncidentTraceStep` stable.
- Endpoints de consultation list/detail/by-correlation figes.
- Base contractuelle suffisante pour `A06.2` backend et `A06.3` UI.
