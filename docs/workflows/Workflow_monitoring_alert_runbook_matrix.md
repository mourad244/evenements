# Workflow monitoring - Alert/runbook matrix (Sprint 5)

Ce document formalise la matrice d'alertes et runbooks pour les
incidents critiques (ticket `M05.1`).

## 1. Objectif

- Associer chaque incident critique a:
  - un signal/metrique de detection,
  - un seuil d'alerte explicite,
  - un runbook operationnel pas a pas.
- Preparer `M05.2` (regles d'alerte) et `M05.3` (runbooks ops).

## 2. Dependances

- `M03.1`: catalogue metriques cible
- `M04.1`: carte des traces critiques
- standards logs/correlation:
  `M02.1`

## 3. Owners et escalade

- Owner primaire alerting:
  `Mourad` (backend/ops)
- Support:
  `Ibrahim` (frontend/admin observability)
- Escalade:
  `L1` on-call -> `L2` owner service -> `L3` lead technique

## 4. Matrice incidents -> alertes -> runbooks

| Incident ID | Incident critique | Signal / metrique | Seuil initial | Severite | Notification | Runbook ID |
| --- | --- | --- | --- | --- | --- | --- |
| INC-N01 | Echecs notification eleves | `notification_send_fail_rate_5m` | `> 5%` sur `10 min` | `P1` | Slack `#ops-alerts` + email | `RB-N01` |
| INC-T01 | Echecs generation billet | `ticket_generation_error_rate_5m` | `> 3%` sur `10 min` | `P1` | Slack `#ops-alerts` + pager | `RB-T01` |
| INC-R01 | Saturation capacite/waitlist incoherente | `registration_capacity_conflict_total` | `>= 1` sur `5 min` | `P1` | Slack `#ops-alerts` + pager | `RB-R01` |
| INC-P01 | Webhooks paiement invalides en spike | `payment_webhook_invalid_signature_total` | `> 20` sur `15 min` | `P2` | Slack `#ops-alerts` | `RB-P01` |
| INC-P02 | Cas reconciliation en backlog | `payment_reconciliation_cases_open_total` | `> 30` sur `30 min` | `P2` | Slack `#ops-alerts` | `RB-P02` |
| INC-G01 | Disponibilite gateway degradee | `gateway_http_5xx_rate_5m` | `> 2%` sur `10 min` | `P1` | Slack + pager | `RB-G01` |

## 5. Regles de calibration

- les seuils sont initialement conservateurs puis ajustes apres
  2 semaines de trafic observe.
- toute modification de seuil doit tracer:
  - ancienne valeur,
  - nouvelle valeur,
  - justification,
  - date et auteur.
- eviter les alertes unitaires non persistantes:
  fenetre glissante minimale imposee.

## 6. Structure runbook minimale

Chaque `Runbook ID` doit contenir:

- symptomes observables
- checks immediats (`5 min`)
- actions de mitigation (`15 min`)
- criteres d'escalade
- procedure de rollback/fallback
- verification post-incident
- journalisation incident (`correlationId`, horodatage, action)

## 7. Runbooks resumés

### RB-N01 - Notification errors spike

1. Verifier `notification_send_fail_rate_5m` et logs corriges par
   `correlationId`.
2. Identifier canal impacte (`email` ou `sms.simulated`).
3. Verifier provider externe (latence, codes erreur).
4. Activer retry progressif / fallback template si applicable.
5. Escalader `L2` si seuil depasse > `20 min`.

### RB-T01 - Ticket generation failures

1. Verifier `ticket_generation_error_rate_5m`.
2. Controler service ticketing et stockage media.
3. Isoler erreurs fonctionnelles vs erreurs infra.
4. Relancer generation pour lot affecte (idempotent).
5. Escalader `L2` immediat si impact evenement imminent.

### RB-R01 - Capacity inconsistency

1. Verifier conflits `registration_capacity_conflict_total`.
2. Identifier evenements affectes.
3. Geler temporairement nouvelles inscriptions sur evenement concerne.
4. Recalculer capacite/waitlist a partir source de verite `registration`.
5. Appliquer correction et consigner action dans audit.

### RB-P01 - Invalid payment webhook spike

1. Verifier evolution de
   `payment_webhook_invalid_signature_total`.
2. Verifier horodatage, rotation secret et fenetre timestamp.
3. Confirmer absence de fuite secret et origine IP callbacks.
4. Bloquer source suspecte si pattern abusif.
5. Escalader securite si suspicion d'attaque.

### RB-P02 - Reconciliation backlog growth

1. Verifier
   `payment_reconciliation_cases_open_total`.
2. Segmenter par categorie (`timeout`, `late callback`, `hard failure`).
3. Prioriser cas affectant inscriptions `PENDING_PAYMENT`.
4. Lancer reprises manuelles outillees (`P04.2`) par lot.
5. Escalader paiement/provider si progression insuffisante.

### RB-G01 - Gateway 5xx degradation

1. Verifier `gateway_http_5xx_rate_5m` par route.
2. Isoler service aval principal en erreur.
3. Appliquer mitigation:
   rate-limit temporaire / circuit-breaker / rollback derniere release.
4. Verifier retour a seuil normal.
5. Cloturer avec timeline incident et actions preventives.

## 8. Observabilite et audit

Logs minimaux alerting:

- `incidentId`
- `service`
- `threshold`
- `observedValue`
- `severity`
- `correlationId`

Audit minimal:

- `MONITORING_ALERT_TRIGGERED`
- `MONITORING_RUNBOOK_STARTED`
- `MONITORING_RUNBOOK_ESCALATED`
- `MONITORING_RUNBOOK_RESOLVED`

## 9. Tests minimaux

- simulation d'un spike notification -> alerte `INC-N01`.
- simulation d'erreur ticketing -> alerte `INC-T01`.
- simulation conflit capacite -> alerte `INC-R01`.
- verification de lien obligatoire vers runbook par incident.
- verification du format de trace audit alerting/runbook.

## 10. Criteres d'acceptation

- chaque incident critique a un seuil, une alerte et un runbook associe.
- le mapping est suffisamment detaille pour implementer `M05.2`.
- le contenu runbook est actionnable pour l'equipe ops (`M05.3`).
