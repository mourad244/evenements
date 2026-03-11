# Backend Service Spec - admin-incident-trace-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `admin-incident-trace-service`
- **Business domain**: chronologie d'incident inter-services
- **Phase cible**: `P3`
- **Backlog refs**: `A06.1`, `A06.2`, `A06.3`

## 1. Domain model

### 1.1 Entites principales

- **IncidentTrace**
  - Champs:
    `incidentId`, `correlationId`, `severity`, `status`, `startedAt`,
    `endedAt?`, `summary`, `primaryDomain`
  - Source de verite:
    `admin-incident-trace-service`

- **IncidentTraceStep**
  - Champs:
    `stepId`, `incidentId`, `timestamp`, `sourceType`, `sourceService`,
    `action`, `targetType`, `targetId`, `result`, `message`,
    `correlationId`, `latencyMs?`, `httpStatus?`, `errorCode?`,
    `metadata?`
  - Source de verite:
    `admin-incident-trace-service`

- **TraceIngestionState**
  - Champs:
    `messageId`, `sourceType`, `sourceService`, `processedAt`, `status`
  - Usage:
    deduplication et suivi des ingestions async

### 1.2 Statuts

- `IncidentTrace.status`:
  `OPEN|INVESTIGATING|RESOLVED|CLOSED`
- `TraceIngestionState.status`:
  `PROCESSED|DUPLICATE_IGNORED|INVALID_REJECTED`

## 2. API surface

### 2.1 `GET /api/admin/incidents/traces`

- Objectif:
  lister/rechercher les incidents.
- Query:
  `correlationId?`, `severity?`, `status?`, `primaryDomain?`,
  `from?`, `to?`, `page`, `pageSize`, `sortBy?`, `sortOrder?`.
- Succes:
  `{ success: true, data: IncidentTrace[], meta }`
- Erreurs:
  `400`, `401`, `403`.
- Role requis:
  `ADMIN`.

### 2.2 `GET /api/admin/incidents/traces/{incidentId}`

- Objectif:
  consulter le detail et la timeline.
- Succes:
  `{ success: true, data: { incident, steps } }`
- Erreurs:
  `401`, `403`, `404`.
- Role requis:
  `ADMIN`.

### 2.3 `GET /api/admin/incidents/traces/by-correlation/{correlationId}`

- Objectif:
  retrouver une chronologie depuis le correlation id.
- Succes:
  `{ success: true, data: { incident, steps } }`
- Erreurs:
  `401`, `403`, `404`.
- Role requis:
  `ADMIN`.

## 3. Evenements asynchrones

Sources d'alimentation:

- `audit.action.recorded` (source metier)
- logs techniques structures (source system)
- events asynchrones metier relies au `correlationId`
- alertes metriques (source monitoring)

Regles d'ingestion:

- deduplication stricte par `messageId`
- creation/upsert incident par `correlationId`
- insertion des steps tries par `timestamp`

## 4. Validation & business rules

- `correlationId` obligatoire pour creer/mettre a jour un incident.
- `stepId` unique par incident.
- `severity` autorisee:
  `LOW|MEDIUM|HIGH|CRITICAL`.
- `result` autorise:
  `SUCCESS|FAILURE|DENIED|UNKNOWN`.
- Si source partielle:
  inserer step `sourceType=METRIC_ALERT`, `result=UNKNOWN`.

## 5. Securite & audit

- Toutes les routes reservees `ADMIN`.
- Redaction des metadonnees sensibles (tokens, secrets, PII brute).
- Journaliser les consultations:
  `ADMIN_INCIDENT_TRACE_VIEWED`.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures:
  `incidentId`, `correlationId`, `stepsCount`, `queryDurationMs`,
  `sourceService`, `result`.
- Metriques:
  `incident_trace_queries_total`,
  `incident_trace_query_latency_ms`,
  `incident_trace_steps_per_incident`,
  `incident_trace_ingest_errors_total`,
  `incident_trace_open_incidents_total`.

## 7. Integrations externes

- `admin-audit-service`:
  source des actions metier sensibles.
- services metier (`event`, `registration`, `notification`, `auth`):
  sources logs/evenements techniques relies au correlation id.
- `admin-console`:
  consommateur sync des routes incident trace.

## 8. Tests minimaux

- `401/403/200` sur routes incident trace.
- recherche par `correlationId` et filtres `severity/status/date`.
- detail incident retourne timeline ordonnee.
- deduplication ingest par `messageId`.
- redaction des donnees sensibles dans `metadata`.

## 9. Definition of Done

- Spec alignee avec le contrat `A06.1`.
- API list/detail/by-correlation stabilisee.
- ingestion multi-sources + idempotence explicites.
- securite, audit et observabilite documentees.
