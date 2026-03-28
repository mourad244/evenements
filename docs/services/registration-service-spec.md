---
title: Spec Registration Service
description: Specification backend du service d'inscription, waitlist et historique participant.
docKind: spec
domain: registration
phase: P1
owner: Mourad
status: DONE
priority: P0
tags:
  - spec
  - registration
  - waitlist
slug: registration-service
---

# Registration Service - Spec P1

> Lire `docs/workflows/Workflow_backend.md` avant implementation.

## 0. Meta

- **Service name**
  `registration-service`

- **Business domain**
  Gerer les inscriptions participant, la capacite effective, la
  liste d'attente, l'annulation, la promotion automatique et la facade
  d'historique participant exposee en `P1`.

- **Phase cible**
  `P1`

- **Backlog refs**
  `R01.1`, `R02.1`, `R03.1`, `R05.1`, `R04.1`

- **Sprint de cadrage**
  `Sprint 0`

## 1. Domain model

### Entites principales

#### `Registration`

- Champs clefs:
  `registrationId`, `eventId`, `participantId`, `status`,
  `waitlistPosition`, `source`, `cancelReason`, `createdAt`, `updatedAt`,
  `cancelledAt`, `promotedAt`
- Relations:
  - appartient a un participant via `participantId`
  - reference un evenement via `eventId`
- Source de verite:
  `registration-service`

#### `EventRegistrationSnapshot`

- Champs clefs:
  `eventId`, `organizerId`, `title`, `city`, `startAt`, `capacity`,
  `visibility`, `eventStatus`, `acceptingRegistrations`, `lastSyncedAt`
- Relations:
  projection locale alimentee depuis `event-management-service`
- Source de verite:
  `event-management-service` pour la politique evenement;
  copie locale derivee dans `registration-service`

Usage:

- verrou event-scope pour les courses de derniere place
- lecture rapide de la policy d'inscription
- enrichissement de l'historique participant

#### `ParticipationView`

- Champs clefs:
  `registrationId`, `eventId`, `eventTitle`, `eventStartAt`, `eventCity`,
  `registrationStatus`, `waitlistPosition`, `canDownloadTicket`,
  `updatedAt`
- Relations:
  projection de lecture derivee de `Registration` et
  `EventRegistrationSnapshot`
- Source de verite:
  `registration-service` pour le contrat de lecture `P1`

### Statuts / transitions

#### Enum `Registration.status`

- `CONFIRMED`
- `WAITLISTED`
- `CANCELLED`
- `REJECTED`

#### Transitions autorisees au MVP `P1`

- creation -> `CONFIRMED`
- creation -> `WAITLISTED`
- `WAITLISTED -> CONFIRMED` via promotion
- `CONFIRMED -> CANCELLED`
- `WAITLISTED -> CANCELLED`

#### Transitions reservees mais non obligatoires en implementation `P1`

- creation -> `REJECTED`
- `WAITLISTED -> REJECTED`

#### Regle d'ownership

- `registration-service` reste owner du statut d'inscription, de
  l'ordre de waitlist et de l'occupation effective des places.
- `event-management-service` reste owner du statut canonique de
  l'evenement, de sa visibilite et de sa capacite configuree.
- `EventRegistrationSnapshot` n'est jamais une source de verite
  primaire; c'est une copie derivee necessaire au traitement
  transactionnel local.

## 2. API surface

### Principes

- Les routes externes passent par la Gateway sous
  `/api/registrations/*` et `/api/profile/*`.
- Les routes MVP sont reservees a `PARTICIPANT` pour l'usage externe.
- Les annulations derivees d'un `event.cancelled` passent par un
  workflow interne, pas par la route publique participant.

### `POST /api/registrations`

- Objectif:
  creer une inscription sur un evenement ouvert
- Body:
  - `eventId`
- Headers recommandes:
  - `Idempotency-Key`
- Reponse de succes:
  `201` avec `registrationId`, `eventId`, `status`,
  `waitlistPosition?`
- Erreurs attendues:
  - `400` payload invalide
  - `401` non authentifie
  - `403` role insuffisant
  - `404` evenement introuvable ou non visible
  - `409` doublon actif pour le meme couple participant/evenement
  - `422` evenement non ouvrable a l'inscription
- Role ou permission requis:
  `PARTICIPANT`
- Idempotence:
  oui fonctionnelle si `Idempotency-Key` est fourni; un retry doit
  renvoyer le meme resultat metier

### `POST /api/registrations/{registrationId}/cancel`

- Objectif:
  annuler une inscription et liberer une place si besoin
- Path params:
  - `registrationId`
- Reponse de succes:
  `200` avec `registrationId`, `status = CANCELLED`,
  `promotedRegistrationId?`
- Erreurs attendues:
  - `401`
  - `403` si le participant n'est pas proprietaire
  - `404`
  - `409` si l'inscription n'est plus annulable
  - `422` si la regle metier refuse l'annulation
- Role ou permission requis:
  `PARTICIPANT`
- Idempotence:
  oui metier; une seconde annulation ne doit pas reproduire une
  promotion

### `GET /api/profile/participations`

- Objectif:
  fournir l'historique et les statuts de participation au participant
- Query params:
  - `status?`
  - `page`
  - `pageSize`
- Reponse de succes:
  `200` avec historique pagine
- Erreurs attendues:
  - `401`
  - `403`
- Role ou permission requis:
  `PARTICIPANT`
- Idempotence:
  oui

## 3. Evenements asynchrones

### `registration.confirmed`

- Producteur:
  `registration-service`
- Consommateurs attendus:
  futur `ticketing-service`, futur `notification-service`,
  futur `admin-service`
- Payload minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `status = CONFIRMED`
  - `source = DIRECT`
  - `confirmedAt`
  - `correlationId`
- Conditions d'emission:
  uniquement sur confirmation directe a la creation
- Comportement sur retry:
  dedoublonnage par `messageId`

### `registration.waitlisted`

- Producteur:
  `registration-service`
- Consommateurs attendus:
  futur `notification-service`, futur `admin-service`
- Payload minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `status = WAITLISTED`
  - `waitlistPosition`
  - `createdAt`
  - `correlationId`
- Conditions d'emission:
  uniquement quand aucune place n'est disponible
- Comportement sur retry:
  dedoublonnage par `messageId`

### `registration.promoted`

- Producteur:
  `registration-service`
- Consommateurs attendus:
  futur `ticketing-service`, futur `notification-service`,
  futur `admin-service`
- Payload minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `previousStatus = WAITLISTED`
  - `status = CONFIRMED`
  - `source = WAITLIST_PROMOTION`
  - `promotedAt`
  - `correlationId`
- Conditions d'emission:
  uniquement lors d'une promotion effective
- Comportement sur retry:
  dedoublonnage par `messageId`

Note:

- en cas de promotion, le service emet `registration.promoted` et non un
  second `registration.confirmed`, pour eviter les doublons downstream.

### `event.cancelled` consume

- Producteur:
  `event-management-service`
- Consommateur:
  `registration-service`
- Effet attendu:
  - marquer les inscriptions actives de l'evenement en `CANCELLED`
  - definir `cancelReason = EVENT_CANCELLED`
  - fermer les nouvelles demandes sur cet evenement
  - ne jamais promouvoir la waitlist dans ce flux
- Comportement sur retry:
  traitement idempotent par `eventId` et `messageId`

### `audit.action.recorded`

- Nom d'evenement:
  `audit.action.recorded`
- Producteur:
  `registration-service`
- Consommateurs attendus:
  futur `admin/audit-store`
- Payload minimal:
  - `actorId`
  - `actorRole`
  - `action`
  - `targetType`
  - `targetId`
  - `result`
  - `occurredAt`
  - `correlationId`
- Conditions d'emission:
  - creation `CONFIRMED`
  - creation `WAITLISTED`
  - annulation participant
  - promotion de waitlist
  - annulation derivee via `event.cancelled`
  - refus critique de doublon ou de policy evenement
- Comportement sur retry:
  dedoublonnage par `messageId`; un replay ne doit pas creer plusieurs
  entrees d'audit finales

## 4. Validation & business rules

### Regles d'entree

- `eventId` obligatoire sur creation
- l'acteur externe doit etre `PARTICIPANT`
- le participant doit etre identifie via les headers Gateway

### Policy evenement retenue pour `P1`

Le choix retenu est:

- validation synchrone de la policy d'inscription depuis
  `event-management-service`
- copie locale dans `EventRegistrationSnapshot` pour verrou et lecture
  locale
- consommation async de `event.cancelled` pour la fermeture derivee

La policy minimale lue sur un evenement:

- `eventId`
- `organizerId`
- `title`
- `city`
- `startAt`
- `capacity`
- `visibility`
- `status`
- `acceptingRegistrations`

### Regles metier de creation

- refuser si une inscription active existe deja pour le meme
  `participantId + eventId`
- refuser si la policy evenement indique:
  - `status != PUBLISHED`
  - `visibility = PRIVATE` en `P1`
  - `acceptingRegistrations = false`
- si `confirmedCount < capacity`, creer `CONFIRMED`
- sinon creer `WAITLISTED` avec une position atomique

### Regles de concurrence

- le service doit appliquer un verrou scope `eventId`
- la transaction de creation doit:
  - verrouiller `EventRegistrationSnapshot`
  - verifier l'absence de doublon actif
  - recalculer la place disponible
  - inserer la `Registration`
  - mettre a jour la waitlist si necessaire

Strategie minimale de verrouillage:

- une ligne `EventRegistrationSnapshot` par `eventId`
- verrou row-level sur cette ligne pour toutes les ecritures
  d'inscription/annulation/promotion

### Regles de waitlist

- ordre primaire: `createdAt` croissant
- tie-breaker: `registrationId` croissant
- `waitlistPosition` doit rester compacte pour les entrees actives
- apres une promotion ou une annulation waitlist, les positions
  restantes sont recompactees dans la meme transaction

### Regles d'annulation

- un participant ne peut annuler que sa propre inscription
- `CONFIRMED -> CANCELLED` libere une place
- `WAITLISTED -> CANCELLED` ne libere pas de place mais recompacte la
  waitlist
- si une place est liberee, la premiere entree `WAITLISTED` est promue
  atomiquement

### Regles derivees d'annulation evenement

- `event.cancelled` annule toutes les inscriptions actives
- aucune promotion n'est autorisee dans ce flux
- le snapshot local de l'evenement passe en fermeture

### Regles de lecture historique

- `GET /api/profile/participations` ne retourne que les inscriptions du
  participant courant
- la vue doit rester lisible meme si l'evenement source n'est plus
  publie
- `canDownloadTicket` reste `false` en `P1`

## 5. Securite & audit

### Type d'auth

- Auth obligatoire via Gateway sur les routes externes
- le service consomme `x-user-id`, `x-user-role`, `x-correlation-id`

### Roles / permissions

- `PARTICIPANT`
  - creer une inscription
  - annuler sa propre inscription
  - lire son historique
- `ORGANIZER`
  - aucun acces externe direct aux routes MVP de registration
- `ADMIN`
  - reserve pour suites admin/moderation

### Actions a journaliser

- inscription `CONFIRMED`
- inscription `WAITLISTED`
- annulation participant
- promotion waitlist
- annulation derivee par `event.cancelled`
- refus de doublon ou refus de policy evenement

### Donnees sensibles a proteger

- aucun secret applicatif dans `Registration`
- ne jamais exposer l'historique d'un autre participant
- ne jamais exposer des details internes de capacity lock ou de policy
  non necessaires a l'UI

## 6. Observabilite

### Health checks

- `GET /health`
- `GET /ready`

### Logs structures

Champs minimums:

- `service = registration-service`
- `route`
- `method`
- `registrationId` si connu
- `eventId`
- `participantId`
- `result`
- `correlationId`

### Metriques metier minimales

- nombre d'inscriptions `CONFIRMED`
- nombre d'inscriptions `WAITLISTED`
- nombre d'annulations
- nombre de promotions
- conflits de doublon
- latence create/cancel

### Correlation-id

- lecture du `x-correlation-id` depuis la Gateway
- propagation dans les logs et events async emis

## 7. Integrations externes

### API Gateway

- mode:
  synchrone
- usage:
  exposition des routes externes, auth, propagation du contexte

### Event Management - lecture synchrone

- mode:
  synchrone
- usage:
  valider la policy d'inscription avant creation
- contrat retenu:
  `GET /internal/events/{eventId}/registration-policy`

Payload de reponse attendu:

- `eventId`
- `organizerId`
- `title`
- `city`
- `startAt`
- `capacity`
- `visibility`
- `status`
- `acceptingRegistrations`

### Event Management - evenement async

- mode:
  async
- usage:
  consommer `event.cancelled`

### Ticketing

- mode:
  async reserve
- usage:
  consommation future de `registration.confirmed` et
  `registration.promoted`

### Notification

- mode:
  async reserve
- usage:
  consommation future de `registration.confirmed`,
  `registration.waitlisted`, `registration.promoted`

## 8. Tests minimaux

### Smoke routes principales

- `POST /api/registrations`
- `POST /api/registrations/{registrationId}/cancel`
- `GET /api/profile/participations`

### Tests `401/403/200`

- absence de token -> `401`
- organisateur sur `POST /api/registrations` -> `403`
- participant sur sa propre annulation -> `200`
- participant sur l'inscription d'un autre -> `403`

### Tests des transitions critiques

- create -> `CONFIRMED`
- create -> `WAITLISTED`
- `WAITLISTED -> CONFIRMED` via promotion
- `CONFIRMED -> CANCELLED`
- `WAITLISTED -> CANCELLED`

### Tests de concurrence / non-regression

- double clic meme participant/meme event
- deux participants sur la derniere place
- annulation confirm -> promotion unique
- replay de `event.cancelled`
- historique participant filtre strictement par proprietaire

## 9. Definition of Done

- spec completee et alignee avec `docs/api-contracts-p1.md`
- ownership des places, statuts et waitlist explicite
- policy sync avec `event-management-service` fixee pour `P1`
- contrat `event.cancelled` consomme de facon idempotente
- base suffisante pour ouvrir `feature/registration-confirmed-flow`,
  `feature/registration-waitlist-flow`,
  `feature/registration-uniqueness-guards`,
  `feature/registration-cancel-flow`,
  `feature/registration-waitlist-promotion` et
  `feature/participant-history-endpoint`
