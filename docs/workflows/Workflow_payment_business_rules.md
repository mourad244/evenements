# Workflow payment - Business rules (Sprint 4)

Ce document formalise les regles business paiement pour annulation et
remboursement (ticket `P01.2`).

## 1. Objectif

- Lever les ambiguitees sur les cas paiement simple, annulation et
  remboursement.
- Aligner les decisions metier entre `payment`, `registration` et
  `ticketing`.
- Donner un cadre executable pour `P02.x` et `P03.x`.

## 2. Statuts cibles

### 2.1 PaymentTransaction.status

- `PENDING`
- `PAID`
- `FAILED`
- `REFUNDED`
- `CANCELLED`

### 2.2 Registration.status (impacte)

- `PENDING_PAYMENT`
- `CONFIRMED`
- `CANCELLED`
- `REFUND_PENDING`
- `REFUNDED`

### 2.3 Ticket.status (impacte)

- `NOT_ISSUED`
- `ISSUED`
- `VOIDED`

## 3. Regles paiement simple

1. Creation d'une inscription payante:
   `Registration.status = PENDING_PAYMENT`.
2. Tant que `Payment.status != PAID`:
   billet final non emis (`Ticket.status = NOT_ISSUED`).
3. Confirmation provider valide:
   `Payment.status = PAID` puis `Registration.status = CONFIRMED`.
4. Echec provider final:
   `Payment.status = FAILED` puis `Registration.status = CANCELLED`.

## 4. Regles annulation

### 4.1 Annulation avant paiement confirme

- autorisee sans remboursement.
- effets:
  - `Payment.status = CANCELLED` (si session ouverte)
  - `Registration.status = CANCELLED`
  - `Ticket.status = NOT_ISSUED`

### 4.2 Annulation apres paiement confirme

- autorisee selon politique evenement.
- effets immediats:
  - `Registration.status = REFUND_PENDING`
  - `Ticket.status = VOIDED` (si deja emis)
- apres execution remboursement:
  - `Payment.status = REFUNDED`
  - `Registration.status = REFUNDED`

## 5. Regles remboursement

- Remboursement simple:
  total uniquement (pas de partiel lot 1).
- Declencheurs autorises:
  - annulation organisateur
  - annulation participant dans fenetre autorisee
  - decision manuelle admin
- Precondition:
  `Payment.status = PAID`.
- Idempotence:
  une transaction ne peut etre remboursee qu'une fois.

## 6. Fenetres et politiques

- `refundWindowHours` configuree par evenement (defaut: 24h avant debut).
- Si hors fenetre:
  remboursement automatique refuse, escalation manuelle possible admin.
- Evenement annule par organisateur/admin:
  remboursement prioritaire force (hors fenetre possible).

## 7. Cas d'erreur et arbitrages

- webhook en retard apres annulation:
  ignorer si statut deja terminal incoherent (`CANCELLED/REFUNDED`).
- double callback paiement:
  traiter une seule fois (dedup `providerTransactionId` + `messageId`).
- timeout provider:
  conserver `PENDING`, lancer reconciliation (`P04.x`).

## 8. Droits et gouvernance

- Participant:
  peut annuler selon politique et voir son statut.
- Organisateur:
  peut annuler evenement; ne peut pas rembourser arbitrairement hors regle.
- Admin:
  peut forcer `REFUND_PENDING` / annoter un cas de reconciliation.

## 9. Audit obligatoire

Actions tracees:

- creation session paiement
- confirmation/refus paiement
- annulation inscription payante
- demande/execution remboursement
- action manuelle admin de reconciliation

Chaque trace contient:

- `paymentTransactionId`
- `registrationId`
- `actorId`
- `action`
- `result`
- `correlationId`

## 10. Criteres d'acceptation

- cas paiement simple, annulation et remboursement arbitres sans
  ambiguite.
- transitions payment/registration/ticket explicites.
- base metier suffisante pour contrats checkout/webhook (`P02.1`) et
  machine d'etat (`P03.1`).
