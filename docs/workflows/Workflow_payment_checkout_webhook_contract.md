# Workflow payment - Checkout & webhook contract (Sprint 4)

Ce document stabilise les contrats checkout et webhook provider
(ticket `P02.1`).

## 1. Objectif

- Figer les payloads de creation session paiement.
- Figer le contrat de callback/webhook provider.
- Definir explicitement verification signature et erreurs.

## 2. Dependances

- `P01.1`: abstraction `PaymentProviderAdapter`
- `P01.2`: regles business paiement

## 3. Frontieres sync/async

- Sync:
  creation session checkout via API.
- Async:
  reception webhook provider pour confirmation/echec.

## 4. Entites contractuelles

### 4.1 `CheckoutSessionRequest`

Champs obligatoires:

- `registrationId`
- `eventId`
- `participantId`
- `amount`
- `currency`
- `successUrl`
- `cancelUrl`

Champs optionnels:

- `metadata` (objet restreint)
- `idempotencyKey` (si non passe en header)

### 4.2 `CheckoutSessionResponse`

- `paymentTransactionId`
- `providerSessionId`
- `checkoutUrl`
- `status` (`PENDING`)
- `expiresAt`
- `correlationId`

### 4.3 `WebhookPaymentUpdate`

- `providerEventId`
- `providerTransactionId`
- `providerSessionId`
- `registrationId`
- `status` (`PAID|FAILED|REFUNDED|CANCELLED`)
- `occurredAt`
- `amount`
- `currency`
- `rawType` (type evenement provider)
- `correlationId`

## 5. API checkout

### 5.1 `POST /api/payments/checkout/sessions`

- Role:
  `PARTICIPANT` (ou system backend autorise)
- Headers:
  - `Authorization`
  - `x-correlation-id`
  - `Idempotency-Key` (recommande)
- Body:
  `CheckoutSessionRequest`
- Succes `201`:
  `{ success: true, data: CheckoutSessionResponse }`
- Erreurs:
  - `400` payload invalide
  - `401` non authentifie
  - `403` role interdit
  - `404` inscription inexistante
  - `409` statut incompatible (deja paye/cancelled)
  - `422` montant ou devise incoherente
  - `500` erreur provider interne

## 6. API webhook provider

### 6.1 `POST /api/payments/webhooks/provider`

- Auth:
  signature provider obligatoire (pas de JWT utilisateur)
- Headers obligatoires:
  - `x-provider-signature`
  - `x-provider-timestamp`
  - `x-correlation-id` (si absent, genere serveur)
- Body:
  payload brut provider (json)

Reponses:

- `200` evenement accepte (traite ou dedupe)
- `400` payload illisible/invalide
- `401` signature absente ou invalide
- `409` evenement obsolete/incompatible avec statut courant
- `500` erreur temporaire (provider retry attendu)

## 7. Verification signature

Regles:

- verifier HMAC/algorithme provider sur le payload brut
- refuser si timestamp hors fenetre (ex: +/- 5 min)
- comparer en constant-time
- ne jamais parser le payload metier avant validation signature

Secrets:

- stockes hors code source
- rotation geree via config securisee

## 8. Mapping statuts provider -> internes

Mapping minimal:

- `payment.succeeded` -> `PAID`
- `payment.failed` -> `FAILED`
- `payment.canceled` -> `CANCELLED`
- `charge.refunded` -> `REFUNDED`

Regles:

- `PAID` confirme -> `Registration = CONFIRMED`
- `FAILED/CANCELLED` -> `Registration = CANCELLED`
- `REFUNDED` -> `Registration = REFUNDED`
- billet final emis seulement apres `PAID` confirme

## 9. Idempotence et deduplication

- Checkout:
  `Idempotency-Key` evite creation de session dupliquee.
- Webhook:
  dedup par `providerEventId` + `providerTransactionId`.
- Toute relecture webhook doit etre sans effet secondaire supplementaire.

## 10. Observabilite & audit

Logs minimum:

- `paymentTransactionId`
- `providerSessionId`
- `providerEventId`
- `registrationId`
- `status`
- `correlationId`

Audit minimum:

- `PAYMENT_CHECKOUT_SESSION_CREATED`
- `PAYMENT_WEBHOOK_ACCEPTED`
- `PAYMENT_WEBHOOK_REJECTED_SIGNATURE`
- `PAYMENT_STATUS_UPDATED`

## 11. Criteres d'acceptation

- payloads checkout/webhook figes et versionnables
- verification signature et rejets invalides explicites
- erreurs `4xx/5xx` normalisees
- base contractuelle suffisante pour `P02.2` et `P02.3`
