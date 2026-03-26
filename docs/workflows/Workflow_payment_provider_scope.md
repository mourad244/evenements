# Workflow payment - Provider scope (Sprint 4)

Ce document fixe le cadrage provider paiement pour le premier lot
Sprint 4 (ticket `P01.1`).

## 1. Objectif

- Choisir une strategie provider exploitable sans couplage excessif.
- Definir les flux de paiement inclus dans le premier lot.
- Poser les contraintes de securite et de tracabilite minimales.

## 2. Hypotheses de depart

- Les evenements payants existent dans le domaine `Event`.
- L'inscription devient effective uniquement apres confirmation paiement.
- Le systeme doit rester extensible a plusieurs providers.

## 3. Options analysees

### Option A - Integrer directement un provider unique

- Avantage:
  mise en marche rapide.
- Risque:
  couplage fort au SDK/provider.

### Option B - Abstraction provider des le premier lot

- Avantage:
  extension future multi-provider et tests facilites.
- Risque:
  surcout de conception initial.

### Option C - Deleguer le paiement a un systeme externe complet

- Avantage:
  moins de logique interne.
- Risque:
  perte de controle metier et integration plus opaque.

## 4. Decision retenue

- Retenir **Option B**:
  abstraction provider interne + implementation initiale d'un provider.
- Pattern:
  `PaymentProviderAdapter` avec operations standardisees.
- Motif:
  equilibre entre vitesse de livraison et maitrise du couplage.

## 5. Perimetre fonctionnel inclus (lot 1)

- creation session checkout
- reception webhook provider signe
- transition transaction:
  `PENDING -> PAID` ou `PENDING -> FAILED`
- support annulation simple
- support remboursement simple (manuel ou API basique)

## 6. Perimetre exclus (lot 1)

- multi-provider actif en production
- split payments / marketplace complexe
- dispute/chargeback automatise
- plans d'abonnement recurrents
- orchestration de fraude avancee

## 7. Contrat d'abstraction provider

Interface cible:

- `createCheckoutSession(input) -> { sessionId, checkoutUrl }`
- `verifyWebhookSignature(rawPayload, signature) -> boolean`
- `mapWebhookEvent(event) -> PaymentStatusUpdate`
- `requestRefund(input) -> { refundId, status }`

`PaymentStatusUpdate` minimal:

- `providerTransactionId`
- `registrationId`
- `status` (`PENDING|PAID|FAILED|REFUNDED`)
- `occurredAt`
- `correlationId`

## 8. Exigences securite et conformite

- verification signature webhook obligatoire
- secret provider stocke hors code source
- redaction des donnees sensibles en logs
- correlation-id propage sur tous les flux paiement

## 9. Impacts backlog immediats

- `P02.1`: contrats checkout/webhook sur base de l'abstraction retenue
- `P02.2`: endpoint checkout branche sur adapter provider
- `P02.3`: verification webhook centralisee
- `P03.x`: alignement statut payment/registration/ticket

## 10. Criteres d'acceptation

- choix provider/abstraction explicite et non ambigu
- flux lot 1 inclus/exclus clarifies
- obligations signature, secret et correlation-id explicites
- base contractuelle suffisante pour ouvrir `P02.1`
