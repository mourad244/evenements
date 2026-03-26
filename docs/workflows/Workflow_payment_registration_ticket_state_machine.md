# Workflow payment - Registration/Ticket state machine (Sprint 4)

Ce document formalise la machine d'etat de coherence entre
`payment-service`, `registration-service` et `ticketing-service`
(ticket `P03.1`).

## 1. Objectif

- Aligner les transitions `PaymentTransaction`, `Registration` et `Ticket`.
- Eviter toute emission de billet tant que le paiement n'est pas confirme.
- Definir une base exploitable pour `P03.2` (propagation) et `P03.3`
  (ticket gating).

## 2. Ownership et frontieres

Source de verite par service:

- `payment-service`:
  `PaymentTransaction.status`
- `registration-service`:
  `Registration.status`
- `ticketing-service`:
  `Ticket.status`

Frontieres sync/async:

- Sync:
  `POST /api/payments/checkout/sessions` (creation `PENDING`).
- Async:
  `payment.transaction.status_updated` (payment -> registration),
  `registration.status_updated` (registration -> ticketing).

## 3. Statuts canonique

### 3.1 PaymentTransaction.status

- `PENDING`
- `PAID`
- `FAILED`
- `CANCELLED`
- `REFUNDED`

### 3.2 Registration.status

- `PENDING_PAYMENT`
- `CONFIRMED`
- `CANCELLED`
- `REFUND_PENDING`
- `REFUNDED`

### 3.3 Ticket.status

- `NOT_ISSUED`
- `ISSUED`
- `VOIDED`

## 4. Transitions payment

| From | Trigger | To | Regle |
| --- | --- | --- | --- |
| none | checkout session cree | `PENDING` | Creation initiale transaction |
| `PENDING` | webhook `payment.succeeded` valide | `PAID` | Signature valide + dedup |
| `PENDING` | webhook `payment.failed` valide | `FAILED` | Echec final provider |
| `PENDING` | webhook `payment.canceled` valide | `CANCELLED` | Annulation avant capture |
| `PAID` | webhook `charge.refunded` valide | `REFUNDED` | Remboursement total confirme |

Regles:

- Etats terminaux:
  `FAILED`, `CANCELLED`, `REFUNDED`.
- Aucun retour arriere vers `PENDING` sur la meme transaction.
- Si nouvel essai paiement requis, creer une nouvelle
  `PaymentTransaction`.

## 5. Propagation payment -> registration

| PaymentTransaction.status | Registration.status cible | Condition |
| --- | --- | --- |
| `PAID` | `CONFIRMED` | inscription en `PENDING_PAYMENT` |
| `FAILED` | `CANCELLED` | echec final confirme |
| `CANCELLED` | `CANCELLED` | annulation avant paiement confirme |
| `REFUNDED` | `REFUNDED` | inscription etait `REFUND_PENDING` ou `CONFIRMED` |

Regles:

- `PENDING` ne confirme jamais l'inscription.
- `REFUND_PENDING` est pose par logique metier (demande annulation/remboursement),
  puis termine en `REFUNDED` apres callback provider valide.
- Toute propagation est idempotente (relecture event sans double effet).

## 6. Propagation registration -> ticket

| Registration.status | Ticket.status cible | Regle |
| --- | --- | --- |
| `CONFIRMED` | `ISSUED` | emission autorisee seulement si paiement `PAID` |
| `PENDING_PAYMENT` | `NOT_ISSUED` | blocage emission |
| `CANCELLED` | `VOIDED` si deja emis, sinon `NOT_ISSUED` | billet inutilisable |
| `REFUNDED` | `VOIDED` | billet invalide apres remboursement |

Regles:

- Invariant fort:
  `Ticket.status = ISSUED` implique
  `PaymentTransaction.status = PAID` et `Registration.status = CONFIRMED`.
- En cas de race (billet emis puis remboursement), `VOIDED` est prioritaire.

## 7. Permissions et commandes autorisees

- `PARTICIPANT`:
  initie checkout; peut demander annulation/remboursement selon politique.
- `ORGANIZER`:
  peut annuler evenement; ne force pas directement un statut payment.
- `ADMIN`:
  peut declencher une action de reconciliation encadree (`P04.x`).
- Provider webhook:
  seule source externe autorisee a faire transiter `PENDING` vers
  `PAID|FAILED|CANCELLED|REFUNDED`.

## 8. Fiabilite et idempotence

- Dedup webhook:
  `providerEventId` (principal) + `providerTransactionId` (secondaire).
- Rejet des transitions obsoletes/incoherentes:
  reponse `409` sans mutation.
- Chaque mutation journalise:
  `paymentTransactionId`, `registrationId`, `ticketId?`, `from`, `to`,
  `cause`, `correlationId`.

## 9. Observabilite et audit

Audit minimal:

- `PAYMENT_STATUS_UPDATED`
- `REGISTRATION_STATUS_UPDATED_FROM_PAYMENT`
- `TICKET_STATUS_UPDATED_FROM_REGISTRATION`
- `PAYMENT_REGISTRATION_TICKET_INVARIANT_BROKEN` (alerte)

Metriques minimales:

- `payment_status_transitions_total`
- `registration_status_updates_from_payment_total`
- `ticket_status_updates_from_registration_total`
- `payment_ticket_gating_block_total`

## 10. Criteres d'acceptation

- Les statuts payment et registration sont alignes avec la generation billet.
- Aucun billet `ISSUED` n'est possible sans paiement `PAID` confirme.
- Les transitions incoherentes sont rejetees sans effet secondaire.
- Les evenements rejoues restent idempotents.
