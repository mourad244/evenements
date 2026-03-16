# Workflow admin - Audit contract (Sprint 3)

Ce document stabilise le contrat d'audit admin transverse (ticket
`A03.1`) pour alimenter la recherche et l'investigation dans la
console admin.

## 1. Objectif

- Definir un schema d'audit unique inter-services.
- Standardiser les filtres obligatoires cote API/UI.
- Garantir la tracabilite des actions sensibles via `correlationId`.

## 2. Ownership et boundaries

- Source de verite:
  `admin/audit-store` (projection de lecture dediee admin).
- Producteurs:
  `identity-access-service`, `event-management-service`,
  `registration-service`, futur `notification-service`.
- Ingestion:
  async via `audit.action.recorded`.
- Consultation:
  sync via routes admin `/api/admin/audit/*`.

## 3. Entite canonique `AuditRecord`

Champs obligatoires:

- `auditId` (string, unique)
- `occurredAt` (ISO timestamp)
- `sourceService` (enum string)
- `actorId` (string)
- `actorRole` (enum: `PARTICIPANT|ORGANIZER|ADMIN|SYSTEM`)
- `action` (string stable, ex: `EVENT_PUBLISHED`)
- `targetType` (string, ex: `EVENT`, `REGISTRATION`, `NOTIFICATION`)
- `targetId` (string)
- `result` (enum: `SUCCESS|FAILURE|DENIED`)
- `correlationId` (string)

Champs optionnels:

- `reasonCode` (string)
- `reasonNote` (string <= 500)
- `metadata` (object json, bornes de taille)
- `ipAddress` (string)
- `userAgent` (string)

## 4. Taxonomie minimale des actions

Actions MVP minimales:

- `USER_REGISTERED`
- `USER_LOGIN_SUCCEEDED`
- `USER_LOGIN_FAILED`
- `EVENT_CREATED`
- `EVENT_UPDATED`
- `EVENT_PUBLISHED`
- `EVENT_CANCELLED`
- `REGISTRATION_CREATED`
- `REGISTRATION_CONFIRMED`
- `REGISTRATION_CANCELLED`
- `MODERATION_APPROVED`
- `MODERATION_REJECTED`
- `NOTIFICATION_SENT`
- `NOTIFICATION_FAILED`

## 5. Filtres admin obligatoires

Recherche listage:

- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `result`
- `sourceService`
- `from` / `to` (date range)
- `correlationId`

Pagination / tri:

- `page`, `pageSize`
- `sortBy` (`occurredAt` par defaut)
- `sortOrder` (`desc` par defaut)

## 6. API admin (contrat minimal)

### 6.1 `GET /api/admin/audit/logs`

- Query: filtres section 5 + pagination/tri.
- Reponse succes:
  `{ success: true, data: AuditRecord[], meta }`
- Erreurs:
  `400` (filtre invalide), `401`, `403`.
- Role requis:
  `ADMIN`.

### 6.2 `GET /api/admin/audit/logs/{auditId}`

- Reponse succes:
  `{ success: true, data: AuditRecord }`
- Erreurs:
  `401`, `403`, `404`.
- Role requis:
  `ADMIN`.

## 7. Contrat async `audit.action.recorded`

Payload minimal attendu (compat avec `docs/async-events-p1.md`):

```json
{
  "actorId": "uuid",
  "actorRole": "ORGANIZER",
  "action": "EVENT_PUBLISHED",
  "targetType": "EVENT",
  "targetId": "uuid",
  "result": "SUCCESS",
  "occurredAt": "2026-03-09T10:00:00Z",
  "correlationId": "corr-123"
}
```

Regles:

- Le consumer admin doit dedupliquer par `messageId`.
- Les champs inconnus sont ignores (forward compatibility).
- Un event invalide est rejete et journalise avec motif.

## 8. Securite, retention et conformite

- Routes audit reservees `ADMIN`.
- Masquer PII sensible dans `metadata` (redaction server-side).
- Retention MVP:
  90 jours en lecture chaude + archivage hors scope.

## 9. Observabilite et qualite

- Metriques:
  `audit_ingested_total`, `audit_ingest_errors_total`,
  `audit_query_latency_ms`.
- Logs structures:
  `correlationId`, `auditId`, `sourceService`, `result`.
- Tests minimaux:
  - ingestion valide + deduplication
  - filtre par `actorId`, `action`, `targetId`, `correlationId`
  - verification `401/403`
