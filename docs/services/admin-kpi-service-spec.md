# Backend Service Spec - admin-kpi-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `admin-kpi-service`
- **Business domain**: agregation et exposition des KPI admin
- **Phase cible**: `P3`
- **Backlog refs**: `A05.1`, `A05.2`, `A05.3`

## 1. Domain model

### 1.1 Entites principales

- **KpiSnapshot**
  - Champs:
    `kpiId`, `window`, `value`, `unit`, `computedAt`, `dataStatus`
  - Source de verite:
    `admin-kpi-service`

- **KpiComputationRun**
  - Champs:
    `runId`, `window`, `startedAt`, `finishedAt`, `status`,
    `sourcesHealth`, `correlationId`
  - Usage:
    tracer les jobs de calcul KPI

### 1.2 KPI MVP

- `KPI-ADM-01`: evenements publies
- `KPI-ADM-02`: taux de remplissage moyen
- `KPI-ADM-03`: attente active
- `KPI-ADM-04`: promotions waitlist
- `KPI-ADM-05`: notifications en echec

### 1.3 Data status

- `OK`
- `DEGRADED`
- `DELAYED`

## 2. API surface

### 2.1 `GET /api/admin/kpi`

- Objectif:
  retourner la vue KPI pour la fenetre demandee.
- Query:
  `window` (`D1|D7|D30`, default `D7`)
- Succes:
  `{ success: true, data: KpiSnapshot[], meta }`
- Erreurs:
  `400`, `401`, `403`.
- Role requis:
  `ADMIN`.

### 2.2 `GET /api/admin/kpi/{kpiId}`

- Objectif:
  detail d'un KPI unique.
- Query:
  `window` (`D1|D7|D30`, default `D7`)
- Succes:
  `{ success: true, data: KpiSnapshot }`
- Erreurs:
  `401`, `403`, `404`.
- Role requis:
  `ADMIN`.

### 2.3 `GET /api/admin/kpi/health`

- Objectif:
  etat de fraicheur des sources et du dernier run.
- Succes:
  `{ success: true, data: { lastRun, sourcesHealth, dataStatus } }`
- Erreurs:
  `401`, `403`.
- Role requis:
  `ADMIN`.

## 3. Evenements asynchrones

Le service consolide ses projections via flux async:

- `event.published`
- `registration.confirmed`
- `registration.waitlisted`
- `registration.promoted`
- `notification.delivery.updated` (ou equivalent notification status)

Regles d'ingestion:

- deduplication par `messageId`
- upsert des compteurs/projections
- recalcul des KPI impactes seulement (incremental compute)

## 4. Validation & business rules

- `window` doit etre `D1`, `D7` ou `D30`.
- `KPI-ADM-02`:
  `sum(confirmed)/sum(capacity)` sur les evenements eligibles.
- `KPI-ADM-05`:
  compter `FAILED`, `BOUNCED` (et equivalents definis par notification).
- si une source est indisponible:
  maintenir derniere valeur connue + `dataStatus=DEGRADED`.
- si `computedAt` > `2x periodicite`:
  `dataStatus=DELAYED`.

## 5. Securite & audit

- Toutes les routes sont reservees `ADMIN`.
- Journaliser toute consultation:
  `ADMIN_KPI_VIEWED`.
- Ne pas exposer de donnees nominatives dans les snapshots KPI.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures:
  `kpiId`, `window`, `value`, `dataStatus`, `computedAt`,
  `correlationId`, `runId`.
- Metriques:
  `admin_kpi_compute_runs_total`,
  `admin_kpi_compute_latency_ms`,
  `admin_kpi_query_latency_ms`,
  `admin_kpi_data_status_total`,
  `admin_kpi_source_lag_ms`.

## 7. Integrations externes

- `event-management-service`:
  source evenements/capacite/publication.
- `registration-service`:
  source inscriptions/confirmees/waitlist/promotions.
- `notification-service`:
  source statuts d'envoi notifications.
- `admin-console`:
  consommateur sync des endpoints KPI.

## 8. Tests minimaux

- `401/403/200` sur `GET /api/admin/kpi`.
- calcul correct des 5 KPI MVP sur jeux de donnees controles.
- bascule `DEGRADED` si source indisponible.
- bascule `DELAYED` si snapshot stale.
- deduplication d'events async par `messageId`.

## 9. Definition of Done

- Spec alignee avec `A05.1` (catalogue KPI).
- API KPI backend stable pour `A05.3`.
- regles de degradation/delai explicites.
- observabilite et securite documentees.
