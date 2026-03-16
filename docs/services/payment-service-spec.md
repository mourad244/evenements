# Backend Service Spec - payment-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `payment-service`
- **Business domain**: initiation de paiement et suivi transactionnel
- **Phase cible**: `P4`
- **Backlog refs**: `P02.1`, `P02.2`, `P02.3`

## 1. Domain model

### 1.1 Entites principales

- **PaymentTransaction**
  - Champs:
    `paymentTransactionId`, `registrationId`, `eventId`, `participantId`,
    `amount`, `currency`, `provider`, `providerTransactionId?`,
    `providerSessionId?`, `status`, `createdAt`, `updatedAt`,
    `expiresAt?`, `correlationId`
  - Source de verite:
    `payment-service`

- **CheckoutSession**
  - Champs:
    `paymentTransactionId`, `providerSessionId`, `checkoutUrl`,
    `status`, `expiresAt`
  - Source de verite:
    projection locale `payment-service`

### 1.2 Statuts

- `PaymentTransaction.status`:
  `PENDING|PAID|FAILED|CANCELLED|REFUNDED`

## 2. API surface

### 2.1 `POST /api/payments/checkout/sessions`

- Objectif:
  demarrer une session checkout provider pour une inscription payante.
- Role:
  `PARTICIPANT` (ou appel technique de confiance via gateway).
- Headers:
  `Authorization`, `x-correlation-id`, `Idempotency-Key` (recommande).
- Body:
  `registrationId`, `eventId`, `participantId`, `amount`, `currency`,
  `successUrl`, `cancelUrl`, `metadata?`.
- Succes `201`:
  `{ success: true, data: { paymentTransactionId, providerSessionId,
  checkoutUrl, status, expiresAt, correlationId } }`
- Erreurs:
  `400`, `401`, `403`, `404`, `409`, `422`, `500`.

### 2.2 `GET /api/payments/transactions/{paymentTransactionId}`

- Objectif:
  lecture de suivi transaction (support UX statut).
- Roles:
  `PARTICIPANT` proprietaire, `ADMIN`.
- Succes:
  `{ success: true, data: PaymentTransaction }`
- Erreurs:
  `401`, `403`, `404`.

## 3. Evenements asynchrones

Evenements emis:

- `payment.checkout.session_created`
- `payment.transaction.status_updated` (emise quand le statut change)

Payload minimal session created:

- `paymentTransactionId`
- `registrationId`
- `providerSessionId`
- `status` (`PENDING`)
- `occurredAt`
- `correlationId`

Note:

- les transitions `PAID/FAILED/REFUNDED/CANCELLED` finales sont
  confirmees par webhook (`P02.3`).

## 4. Validation & business rules

- `registrationId`, `eventId`, `participantId` obligatoires.
- `amount > 0`, `currency` supportee.
- inscription doit etre en `PENDING_PAYMENT`.
- refuser creation si transaction terminale existe deja (`PAID`,
  `REFUNDED`, `CANCELLED`).
- idempotence par `Idempotency-Key` + `registrationId`.

## 5. Securite & audit

- auth obligatoire sur endpoint checkout.
- verification ownership:
  participant ne peut payer que sa propre inscription.
- audit obligatoire:
  `PAYMENT_CHECKOUT_SESSION_CREATED` avec `correlationId`.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures:
  `paymentTransactionId`, `registrationId`, `providerSessionId`,
  `status`, `result`, `correlationId`.
- Metriques:
  `payment_checkout_sessions_created_total`,
  `payment_checkout_latency_ms`,
  `payment_checkout_errors_total`,
  `payment_transactions_pending_total`.

## 7. Integrations externes

- `registration-service`:
  validation de l'inscription payante cible.
- `payment-provider-adapter`:
  creation session provider (`createCheckoutSession`).
- `admin-audit-service` (indirect):
  consommation des traces d'audit paiement.

## 8. Tests minimaux

- `401/403/201` sur checkout.
- payload invalide -> `400`.
- inscription absente -> `404`.
- statut incompatible -> `409`.
- dedup idempotency key -> pas de double session provider.

## 9. Definition of Done

- endpoint checkout (`P02.2`) specifiable sans ambiguite.
- regles de validation et idempotence explicites.
- integration provider adapter claire.
- base prete pour l'implementation webhook `P02.3`.
