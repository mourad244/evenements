# Workflow payment - Organizer encaissements view contract (Sprint 4)

Ce document stabilise le contrat de la vue organisateur des encaissements
(ticket `P05.1`).

## 1. Objectif

- Definir les colonnes, filtres et statuts visibles cote organisateur.
- Fixer les regles d'isolation des donnees par evenement/organisateur.
- Fournir une base claire pour `P05.2` (API liste/export) et `P05.3` (UI).

## 2. Dependances

- `P03.1`: machine d'etat payment/registration/ticket
- `P04.1`: reconciliation rules
- `P04.3`: audit trail paiement

## 3. Surface UI cible

Routes cibles:

- `GET /organizer/events/:eventId/payments`
- `GET /organizer/events/:eventId/payments/export` (etat export)

Acces:

- role `ORGANIZER` (owner evenement) ou `ADMIN`.
- non-auth:
  redirect `/auth/login?next=/organizer/events/:eventId/payments`.
- non-owner et non-admin:
  `403` (`StateForbidden`).

## 4. Contrat de donnees ligne paiement

Objet `OrganizerPaymentRow`:

- `paymentTransactionId`
- `eventId`
- `eventTitle`
- `registrationId`
- `participantDisplay` (pseudo, email masquee, ou id partiel)
- `status` (`PENDING|PAID|FAILED|CANCELLED|REFUNDED`)
- `reconciliationStatus` (`NONE|NEEDS_REVIEW|IN_PROGRESS|RESOLVED|IRRECOVERABLE`)
- `amountGross`
- `amountRefunded`
- `amountNet`
- `currency`
- `providerName`
- `providerReferenceMasked`
- `paidAt`
- `updatedAt`

Contraintes:

- aucun PAN/carte, token provider sensible, secret webhook, payload brut
  provider ou PII non necessaire ne doit etre expose.
- `participantDisplay` est pseudonymise par defaut.

## 5. Colonnes UI minimales

- `Transaction`
- `Participant`
- `Statut paiement`
- `Statut reconciliation`
- `Montant brut`
- `Rembourse`
- `Net`
- `Devise`
- `Date paiement`
- `Derniere mise a jour`
- `Actions` (`Voir detail`, `Exporter`)

## 6. Filtres et tri minimaux

Filtres:

- `status` (multi-select)
- `reconciliationStatus` (multi-select)
- `dateFrom`, `dateTo`
- `amountMin`, `amountMax`
- `query` (sur `paymentTransactionId`, `registrationId`, `participantDisplay`)

Tri:

- par defaut:
  `paidAt desc`
- options:
  `paidAt`, `amountNet`, `updatedAt`
- direction:
  `asc|desc`

Pagination:

- `page`, `pageSize` (`10|20|50`)
- `totalItems`, `totalPages` retournes par API.

## 7. Statuts visibles et labels UI

`status`:

- `PENDING` -> `Pending`
- `PAID` -> `Paid`
- `FAILED` -> `Failed`
- `CANCELLED` -> `Cancelled`
- `REFUNDED` -> `Refunded`

`reconciliationStatus`:

- `NONE` -> `No issue`
- `NEEDS_REVIEW` -> `Needs review`
- `IN_PROGRESS` -> `In progress`
- `RESOLVED` -> `Resolved`
- `IRRECOVERABLE` -> `Irrecoverable`

Regles:

- afficher `reconciliationStatus` en badge distinct du `status` paiement.
- `PAID + NEEDS_REVIEW` est autorise visuellement (incident de coherence).

## 8. Contrat API cible pour `P05.2`

### 8.1 Liste

`GET /api/organizer/events/{eventId}/payments`

Query:

- `status[]`
- `reconciliationStatus[]`
- `dateFrom`
- `dateTo`
- `amountMin`
- `amountMax`
- `query`
- `sortBy`
- `sortDir`
- `page`
- `pageSize`

Succes `200`:

- `items: OrganizerPaymentRow[]`
- `pagination: { page, pageSize, totalItems, totalPages }`
- `summary: { totalGross, totalRefunded, totalNet, currency }`
- `correlationId`

Erreurs:

- `400` filtre invalide
- `401` non authentifie
- `403` acces interdit ou event hors ownership
- `404` evenement inconnu
- `500` erreur interne

### 8.2 Export

`POST /api/organizer/events/{eventId}/payments/export`

Body:

- meme filtre que liste + `format` (`csv` au minimum)

Succes `202`:

- `exportId`
- `status` (`RUNNING|READY|FAILED`)
- `downloadUrl` (si pret)

Regles:

- export scope au seul `eventId` autorise.
- toute tentative cross-event est refusee (`403`).

## 9. ACL et isolation de donnees

- un organisateur voit uniquement les paiements de ses evenements.
- un admin peut lire tous les evenements via vues admin dediees.
- toute lecture ecrit une trace audit:
  `PAYMENT_ORGANIZER_VIEW_ACCESSED`.
- toute demande export ecrit:
  `PAYMENT_ORGANIZER_EXPORT_REQUESTED`.

## 10. Observabilite

Logs minimum:

- `eventId`
- `organizerId`
- `filtersHash`
- `resultCount`
- `exportId` (si export)
- `correlationId`

Metriques minimales:

- `payment_organizer_list_requests_total`
- `payment_organizer_export_requests_total`
- `payment_organizer_export_ready_total`
- `payment_organizer_forbidden_total`

## 11. Tests minimaux

- `403` si organisateur accede a un evenement qui ne lui appartient pas.
- mapping correct des colonnes/statuts dans la reponse liste.
- filtres `status`, `date`, `amount` appliques correctement.
- export restreint au scope evenement cible.
- absence de champs sensibles dans payload retourne.

## 12. Criteres d'acceptation

- les colonnes, filtres et statuts visibles sont stabilises.
- le scope de donnees organisateur est explicite et verifiable.
- le contrat est directement implementable en `P05.2` et `P05.3`.
