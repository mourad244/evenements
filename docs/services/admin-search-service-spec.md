# Backend Service Spec - admin-search-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `admin-search-service`
- **Business domain**: recherche multicriteres admin sur users/events
- **Phase cible**: `P3`
- **Backlog refs**: `A04.1`, `A04.2`, `A04.3`

## 1. Domain model

### 1.1 Entites principales

- **AdminSearchDocument**
  - Champs:
    `docId`, `type`, `entityId`, `title`, `subtitle`, `status`,
    `updatedAt`, `searchTokens`, `highlights?`, `navigationRoute`
  - Source de verite:
    `admin-search-service` (index de lecture admin)

- **AdminSearchIngestionState**
  - Champs:
    `messageId`, `producer`, `eventName`, `processedAt`, `status`
  - Usage:
    deduplication et suivi des replays async

### 1.2 Types supportes

- `USER`
- `EVENT`

### 1.3 Statuts d'ingestion

- `PROCESSED`
- `DUPLICATE_IGNORED`
- `INVALID_REJECTED`

## 2. API surface

### 2.1 `GET /api/admin/search`

- Objectif:
  recherche globale user/event avec filtres.
- Query:
  `q?`, `type?`, `status?`, `role?`, `city?`, `from?`, `to?`,
  `createdFrom?`, `createdTo?`, `page`, `pageSize`, `sortBy?`,
  `sortOrder?`.
- Succes:
  `{ success: true, data: SearchResultItem[], meta }`
- Erreurs:
  `400`, `401`, `403`.
- Role requis:
  `ADMIN`.

### 2.2 `GET /api/admin/search/suggestions`

- Objectif:
  autocomplete des recherches admin.
- Query:
  `q`, `type?`, `limit?`.
- Succes:
  `{ success: true, data: SuggestionItem[] }`
- Erreurs:
  `400`, `401`, `403`.
- Role requis:
  `ADMIN`.

### 2.3 `GET /api/admin/search/{type}/{entityId}`

- Objectif:
  detail rapide d'un resultat pour ouverture UI.
- Succes:
  `{ success: true, data: SearchResultItem }`
- Erreurs:
  `401`, `403`, `404`.
- Role requis:
  `ADMIN`.

## 3. Evenements asynchrones

Le service alimente son index via events des services owners:
`identity-access-service` et `event-management-service`.

### 3.1 Consumption (minimum)

- `user.created`
- `user.updated`
- `user.role_changed`
- `user.status_changed`
- `event.created`
- `event.updated`
- `event.published`
- `event.cancelled`

Payload minimal attendu:

- identifiant entite (`userId` ou `eventId`)
- champs de projection utiles recherche
- `occurredAt`
- `correlationId`

Retry / idempotence:

- dedup strict par `messageId`;
- upsert par couple (`type`, `entityId`).

## 4. Validation & business rules

- `page >= 1`
- `1 <= pageSize <= 100`
- `type` dans `USER|EVENT|ALL`
- `sortOrder` dans `asc|desc`
- `from/to` et `createdFrom/createdTo` doivent etre ISO valides
- si `type=USER`, ignorer filtres `city`
- si `type=EVENT`, ignorer filtres `role`
- les champs sensibles (`password`, `token`, secret) sont exclus de
  l'index et de la reponse

## 5. Securite & audit

- Toutes les routes sont reservees `ADMIN`.
- Auth appliquee via Gateway + verification role.
- Chaque requete de recherche genere une trace:
  `ADMIN_SEARCH_EXECUTED`.
- Les resultats ne doivent pas exposer de PII non necessaire.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures:
  `service`, `queryHash`, `filters`, `resultCount`, `durationMs`,
  `correlationId`.
- Metriques:
  `admin_search_queries_total`,
  `admin_search_latency_ms`,
  `admin_search_index_size`,
  `admin_search_index_lag_ms`,
  `admin_search_ingest_errors_total`.

## 7. Integrations externes

- `identity-access-service`:
  source de verite users (async ingest).
- `event-management-service`:
  source de verite events (async ingest).
- `admin-console`:
  consommateur sync de `GET /api/admin/search*`.

## 8. Tests minimaux

- `401/403/200` sur routes search.
- filtre combinatoire user/event (q + status + date + type).
- pagination stable et tri conforme.
- suggestions avec `limit` max.
- ingestion event valide et dedup `messageId`.
- verification de redaction champs sensibles.

## 9. Definition of Done

- Spec alignee avec le contrat `A04.1`.
- Endpoints backend pour recherche/suggestions stabilises.
- ingestion async + idempotence explicites.
- ACL admin, audit et observabilite documentes.
