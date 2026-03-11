# Workflow payment - Webhook verification (Sprint 4)

Ce document decrit l'implementation de verification webhook provider
(ticket `P02.3`).

## 1. Objectif

- Accepter uniquement les callbacks provider authentiques.
- Rejeter strictement les signatures invalides.
- Rendre le traitement idempotent et auditable.

## 2. Dependances

- `P02.1`: contrat checkout/webhook
- `P02.2`: `payment-service` et `PaymentTransaction`

## 3. Endpoint cible

- `POST /api/payments/webhooks/provider`

Headers requis:

- `x-provider-signature`
- `x-provider-timestamp`
- `x-correlation-id` (genere si absent)

Body:

- payload brut provider (json string non modifiee)

## 4. Pipeline de verification

Ordre obligatoire:

1. Lire payload brut (avant parse metier).
2. Verifier presence des headers signature/timestamp.
3. Verifier fenetre temporelle du timestamp (ex: +/- 5 min).
4. Calculer signature HMAC/algorithme provider attendu.
5. Comparer en constant-time.
6. Parse metier uniquement si signature valide.
7. Verifier dedup event (`providerEventId`).
8. Mapper statut provider -> statut interne.

## 5. Reponses HTTP standard

- `200`:
  evenement valide et accepte (traite ou dedupe).
- `400`:
  payload malforme / champs critiques absents.
- `401`:
  signature absente, invalide ou timestamp hors fenetre.
- `409`:
  evenement obsolete/incompatible avec statut courant.
- `500`:
  erreur interne temporaire (retry provider attendu).

## 6. Regles anti-replay et idempotence

- dedup principal:
  `providerEventId`.
- dedup secondaire:
  `providerTransactionId` + type evenement.
- relecture du meme evenement:
  reponse `200` sans double effet de statut.
- stocker `processedAt` et `correlationId` pour chaque event dedupe.

## 7. Mapping metier

Mapping minimal:

- `payment.succeeded` -> `PAID`
- `payment.failed` -> `FAILED`
- `payment.canceled` -> `CANCELLED`
- `charge.refunded` -> `REFUNDED`

Effets metier:

- `PAID` -> propagation vers `Registration = CONFIRMED`.
- `FAILED|CANCELLED` -> `Registration = CANCELLED`.
- `REFUNDED` -> `Registration = REFUNDED`.

## 8. Securite et secrets

- secret webhook stocke hors code source.
- rotation de secret supportee sans downtime (current + previous).
- logs sans fuite de secret ni payload carte.
- limiter la taille payload pour eviter abus.

## 9. Observabilite

Logs minimum:

- `providerEventId`
- `providerTransactionId`
- `paymentTransactionId`
- `verificationResult` (`VALID|INVALID|EXPIRED|MISSING`)
- `statusMapped`
- `correlationId`

Metriques:

- `payment_webhook_received_total`
- `payment_webhook_verified_total`
- `payment_webhook_invalid_signature_total`
- `payment_webhook_dedup_total`
- `payment_webhook_processing_latency_ms`

Audit:

- `PAYMENT_WEBHOOK_ACCEPTED`
- `PAYMENT_WEBHOOK_REJECTED_SIGNATURE`
- `PAYMENT_WEBHOOK_REJECTED_REPLAY`

## 10. Tests minimaux

- signature valide -> `200` + mise a jour statut attendue.
- signature invalide -> `401`.
- timestamp expire -> `401`.
- replay `providerEventId` -> `200` sans double traitement.
- mapping `payment.succeeded/failed/canceled/refunded` conforme.
- payload invalide -> `400`.

## 11. Criteres d'acceptation

- callbacks non signes ou mal signes refuses.
- callbacks valides traites une seule fois.
- traces d'audit et metriques disponibles pour investigation.
