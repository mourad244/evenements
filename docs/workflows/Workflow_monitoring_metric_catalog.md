# Workflow monitoring - Metric catalog (Sprint 0)

Ce document formalise le catalogue des metriques techniques et metier
(ticket `M03.1`).

## 1. Objectif

- Lister les metriques cibles prioritaires pour ops et produit.
- Identifier la source de verite de chaque metrique.
- Preparer `M03.2` (emission) et `M03.3` (panels dashboard).

## 2. Scope

Composants cibles:

- API Gateway
- Registration
- Ticketing
- Notification
- Payment

Sortie attendue:

- definition explicite des metriques prioritaires.
- type metrique, labels et source de collecte identifies.
- formules de KPI derivees pour dashboards/admin.

## 3. Conventions

- Prefixes:
  - `gateway_*` pour metriques HTTP de la Gateway.
  - `notification_*`, `ticket_*`, `registration_*`, `payment_*` par domaine.
- Types:
  - `counter` pour volumes cumulatif.
  - `gauge` pour etat instantane.
  - `histogram` pour distributions de latence.
- Cardinalite:
  - limiter les labels a faible cardinalite (`service`, `channel`, `statusClass`).
  - `eventId` reserve aux incidents capacite (usage investigation, pas dashboard global).

## 4. Metriques prioritaires (catalogue)

| Metrique | Type | Definition | Source | Labels |
| --- | --- | --- | --- | --- |
| `gateway_http_requests_total` | counter | nombre total de requetes HTTP traitees | gateway middleware request | `service`, `route`, `method`, `statusClass` |
| `gateway_http_5xx_total` | counter | nombre total de reponses HTTP `5xx` | gateway middleware request | `service`, `route`, `method` |
| `gateway_http_request_duration_ms` | histogram | distribution des latences HTTP | gateway middleware request | `service`, `route`, `method` |
| `notification_send_total` | counter | tentatives d'envoi notification | notification worker send | `service`, `channel`, `status` |
| `notification_send_failed_total` | counter | echecs d'envoi notification | notification worker send | `service`, `channel`, `errorClass` |
| `notification_send_duration_ms` | histogram | latence d'envoi notification | notification worker send | `service`, `channel` |
| `ticket_generation_total` | counter | tentatives generation billet | ticketing generator | `service`, `status` |
| `ticket_generation_error_total` | counter | erreurs generation billet | ticketing generator | `service`, `errorClass` |
| `ticket_generation_duration_ms` | histogram | latence generation billet | ticketing generator | `service` |
| `registration_capacity_conflict_total` | counter | conflits capacite inscription detectes | registration write path | `service`, `eventId` |
| `payment_webhook_invalid_signature_total` | counter | signatures webhook paiement invalides | payment webhook verifier | `service`, `provider` |
| `payment_reconciliation_cases_open` | gauge | cas reconciliation ouverts | payment reconciliation tracker | `service`, `category` |

## 5. KPI derives pour dashboards (`M03.3`)

| KPI derive | Formule | Fenetre | Source primaire |
| --- | --- | --- | --- |
| `gateway_http_5xx_rate_5m` | `gateway_http_5xx_total / gateway_http_requests_total` | 5 min | metriques gateway |
| `notification_send_fail_rate_5m` | `notification_send_failed_total / notification_send_total` | 5 min | metriques notification |
| `ticket_generation_error_rate_5m` | `ticket_generation_error_total / ticket_generation_total` | 5 min | metriques ticketing |
| `payment_webhook_invalid_signature_15m` | somme `payment_webhook_invalid_signature_total` | 15 min | metriques payment |
| `payment_reconciliation_cases_open_total` | somme `payment_reconciliation_cases_open` | instantane | gauge payment |
| `registration_capacity_conflict_5m` | delta `registration_capacity_conflict_total` | 5 min | metriques registration |

## 6. Mapping implementation existante

Implementation backlog `M03.2`:

- module:
  `services/shared/monitoringMetricsEmission.js`
- tests:
  `tests/s5-t02.monitoring-metrics-emission.unit.test.js`

Les metriques du tableau section 4 sont alignees avec les definitions
`PRIORITY_METRIC_DEFINITIONS` de ce module.

## 7. Criteres d'acceptation (`M03.1`)

- les metriques techniques et metier prioritaires sont listees.
- chaque metrique a une definition et une source identifiees.
- les KPI derives necessaires au dashboard ops sont explicites.
