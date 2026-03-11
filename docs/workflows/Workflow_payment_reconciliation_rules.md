# Workflow payment - Reconciliation rules (Sprint 4)

Ce document formalise le modele d'erreur et de reconciliation paiement
pour `PaymentTransaction` (ticket `P04.1`).

## 1. Objectif

- Couvrir les cas d'anomalie paiement sans casser la coherence metier.
- Definir une strategie claire pour timeout, callback en retard
  et echec irreversible.
- Preparer `P04.2` (outil de reprise) et `P04.3` (audit paiement).

## 2. Ownership et frontieres

- Source de verite transaction:
  `payment-service` (`PaymentTransaction`).
- Source de verite inscription:
  `registration-service`.
- Source de verite billet:
  `ticketing-service`.

Frontieres:

- Sync:
  creation checkout/session.
- Async:
  webhook provider + events internes de propagation.

## 3. Modele `PaymentTransaction` pour reconciliation

Champs minimaux supplementaires:

- `status`:
  `PENDING|PAID|FAILED|CANCELLED|REFUNDED`
- `reconciliationStatus`:
  `NONE|NEEDS_REVIEW|IN_PROGRESS|RESOLVED|IRRECOVERABLE`
- `failureCategory`:
  `NONE|PROVIDER_TIMEOUT|WEBHOOK_SIGNATURE_INVALID|WEBHOOK_TOO_LATE|STATE_CONFLICT|PROVIDER_HARD_FAILURE`
- `failureCode`:
  code technique normalise.
- `failureReason`:
  message metier court.
- `lastProviderEventAt`
- `lastReconciliationAttemptAt`
- `reconciliationAttempts`
- `manualActionRequired` (`true|false`)
- `resolutionNote`

## 4. Classes d'incident

### 4.1 Timeout provider

- Symptome:
  checkout cree, aucun callback final dans la fenetre attendue.
- Regle:
  conserver `status = PENDING`,
  positionner `reconciliationStatus = NEEDS_REVIEW`,
  `failureCategory = PROVIDER_TIMEOUT`.
- Action:
  lancer job de verification provider (pull status) avec retries bornes.

### 4.2 Callback en retard

- Symptome:
  callback arrive apres bascule locale terminale/incompatible.
- Regle:
  refuser mutation incoherente (`409`) et journaliser
  `failureCategory = WEBHOOK_TOO_LATE` ou `STATE_CONFLICT`.
- Action:
  ouvrir un cas reconciliation si impact financier possible.

### 4.3 Echec irreversible

- Symptome:
  provider retourne un code terminal non recuperable
  (payment declined definitif, account blocked, etc.).
- Regle:
  basculer `status = FAILED`,
  `reconciliationStatus = IRRECOVERABLE`,
  `manualActionRequired = false`.
- Action:
  informer les vues metier; aucun retry automatique.

## 5. Politique de retry et escalade

- Retry automatique uniquement pour erreurs transitoires:
  timeout, indisponibilite provider, erreurs reseau.
- Backoff recommande:
  `1m`, `5m`, `15m`, `1h`, puis escalade.
- Seuil d'escalade:
  apres `N` tentatives (ex: 5), passer en `NEEDS_REVIEW`.
- Les erreurs irreversibles bypassent la boucle retry.

## 6. Matrice de decision reconciliation

| Situation | Transaction | Reconciliation | Action principale |
| --- | --- | --- | --- |
| Timeout sans callback | `PENDING` | `NEEDS_REVIEW` | verifier statut provider puis reprendre |
| Callback valide mais en retard et compatible | status mis a jour | `RESOLVED` | appliquer transition idempotente |
| Callback en retard incompatible | statut conserve | `NEEDS_REVIEW` | ouvrir investigation manuelle |
| Erreur provider definitive | `FAILED` | `IRRECOVERABLE` | cloturer sans retry |
| Incoherence payment/registration/ticket | statut selon owner | `IN_PROGRESS` | corriger via outil `P04.2` + audit |

## 7. Invariants de coherence

- `Ticket = ISSUED` interdit si `Payment != PAID`.
- `Registration = CONFIRMED` doit etre soutenue par un paiement `PAID`.
- Une transition terminale ne peut pas etre ecrasee par un evenement obsolete.
- Toute correction manuelle doit laisser une trace d'audit explicite.

## 8. API/commandes cibles (base pour `P04.2`)

Endpoints cibles:

- `GET /api/payments/reconciliation/cases`
- `GET /api/payments/reconciliation/cases/{caseId}`
- `POST /api/payments/reconciliation/cases/{caseId}/retry`
- `POST /api/payments/reconciliation/cases/{caseId}/resolve`
- `POST /api/payments/reconciliation/cases/{caseId}/mark-irrecoverable`

Commandes/events internes:

- `payment.reconciliation.case_opened`
- `payment.reconciliation.retry_requested`
- `payment.reconciliation.resolved`
- `payment.reconciliation.irrecoverable_marked`

## 9. Observabilite et audit

Logs minimum:

- `paymentTransactionId`
- `providerTransactionId`
- `registrationId`
- `ticketId`
- `failureCategory`
- `reconciliationStatus`
- `attempt`
- `correlationId`

Metriques:

- `payment_reconciliation_cases_open_total`
- `payment_reconciliation_cases_resolved_total`
- `payment_reconciliation_cases_irrecoverable_total`
- `payment_reconciliation_retry_total`
- `payment_reconciliation_age_seconds`

Audit minimum:

- `PAYMENT_RECONCILIATION_CASE_OPENED`
- `PAYMENT_RECONCILIATION_RETRY_TRIGGERED`
- `PAYMENT_RECONCILIATION_RESOLVED`
- `PAYMENT_RECONCILIATION_MARKED_IRRECOVERABLE`
- `PAYMENT_MANUAL_OVERRIDE_APPLIED`

## 10. Criteres d'acceptation

- Les cas timeout, callback en retard et echec irreversible sont couverts.
- Le modele d'erreur `PaymentTransaction` est suffisamment explicite
  pour guider une reprise manuelle.
- Les regles de retry/escalade sont bornees et auditables.
- Les invariants payment/registration/ticket restent preservables en incident.
