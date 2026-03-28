# Backend Service Spec - admin-audit-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `admin-audit-service`
- **Business domain**: stockage et recherche des actions sensibles
- **Phase cible**: `P3`

## 1. Domain model

### 1.1 Entites principales

- **AuditRecord**
  - Champs:
    `auditId`, `occurredAt`, `sourceService`, `actorId`, `actorRole`,
    `action`, `targetType`, `targetId`, `result`, `correlationId`,
    `reasonCode?`, `reasonNote?`, `metadata?`
  - Source de verite: `admin-audit-service`

- **AuditIngestionState**
  - Champs: `messageId`, `eventName`, `processedAt`, `status`
  - Usage: deduplication des events async

### 1.2 Statuts / transitions

- `AuditIngestionState.status`:
  - `PROCESSED`
  - `DUPLICATE_IGNORED`
  - `INVALID_REJECTED`

## 2. API surface

### 2.1 `GET /api/admin/audit/logs`

- Objectif: recherche paginee des traces d'audit.
- Query:
  `actorId?`, `actorRole?`, `action?`, `targetType?`, `targetId?`,
  `result?`, `sourceService?`, `from?`, `to?`, `correlationId?`,
  `page`, `pageSize`, `sortBy?`, `sortOrder?`.
- Succes:
  `{ success: true, data: AuditRecord[], meta }`
- Erreurs: `400`, `401`, `403`.
- Role: `ADMIN`.

### 2.2 `GET /api/admin/audit/logs/{auditId}`

- Objectif: detail d'une trace.
- Succes:
  `{ success: true, data: AuditRecord }`
- Erreurs: `401`, `403`, `404`.
- Role: `ADMIN`.

## 3. Evenements asynchrones

### 3.1 Consommation `audit.action.recorded`

- Producteur:
  tout service metier (`event`, `registration`, `identity`, `notification`)
- Payload minimal:
  `actorId`, `actorRole`, `action`, `targetType`, `targetId`, `result`,
  `occurredAt`, `correlationId`
- Conditions d'ingestion:
  valider les champs minimaux puis upsert en `AuditRecord`
- Retry / idempotence:
  dedup par `messageId` via `AuditIngestionState`

### 3.2 Event interne optionnel

- `admin.audit.ingestion_failed` (interne observabilite)
- Usage:
  alerte ingestion pour payload invalide ou erreur stockage

## 4. Validation & business rules

- `occurredAt` doit etre un ISO timestamp valide.
- `actorRole` autorise:
  `PARTICIPANT|ORGANIZER|ADMIN|SYSTEM`.
- `result` autorise:
  `SUCCESS|FAILURE|DENIED`.
- `reasonNote` limitee a 500 chars.
- Les traces sont immuables apres insertion.

## 5. Securite & audit

- Auth via Gateway.
- Lecture reservee aux `ADMIN`.
- Redaction des donnees sensibles dans `metadata`.
- Toute consultation admin est journalisee:
  `AUDIT_LOGS_QUERIED`, `AUDIT_LOG_VIEWED`.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures:
  `service`, `auditId`, `action`, `targetId`, `correlationId`,
  `queryFilters`, `result`.
- Metriques:
  `audit_ingested_total`, `audit_ingest_errors_total`,
  `audit_query_latency_ms`, `audit_query_total`.

## 7. Integrations externes

- Ingestion async depuis bus d'evenements.
- Aucun appel synchrone obligatoire vers d'autres services pour la
  lecture standard.

## 8. Tests minimaux

- Ingestion valide de `audit.action.recorded`.
- Deduplication `messageId`.
- Rejet payload invalide.
- Filtres principaux:
  `actorId`, `action`, `targetId`, `correlationId`, date range.
- Permissions:
  `401/403/200` sur routes admin.

## 9. Definition of Done

- Spec completee et alignee avec `A03.1`.
- API de recherche admin explicite.
- Ingestion async + idempotence definies.
- Securite, observabilite et tests minimaux documentes.
