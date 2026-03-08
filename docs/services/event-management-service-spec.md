# Event Management Service - Spec P1

> Lire `docs/workflows/Workflow_backend.md` avant implementation.

## 0. Meta

- **Service name**
  `event-management-service`

- **Business domain**
  Gerer les brouillons organisateur, la publication immediate, le
  listing "Mes evenements", l'ownership des ressources evenement et les
  hooks de cycle de vie exposes au reste de la plateforme.

- **Phase cible**
  `P1`

- **Backlog refs**
  `E01.1`, `E01.2`, `E01.3`, `E02.1`, `E03.1`, `E05.1`, `E06.1`,
  `I04.1`

- **Sprint de cadrage**
  `Sprint 0`

## 1. Domain model

### Entites principales

#### `Event`

- Champs clefs:
  `eventId`, `organizerId`, `title`, `description`, `theme`,
  `venueName`, `city`, `startAt`, `endAt`, `timezone`, `capacity`,
  `visibility`, `pricingType`, `status`, `coverImageRef`, `publishedAt`,
  `createdAt`, `updatedAt`
- Relations:
  - appartient a un `User` organisateur via `organizerId`
  - alimente une projection `CatalogEventView`
  - est reference par les `Registration`
- Source de verite:
  `event-management-service`

#### `EventOwnershipPolicy`

- Champs clefs:
  `eventId`, `organizerId`, `manageableByAdmin`
- Relations:
  policy logique rattachee a `Event`
- Source de verite:
  `event-management-service`

Cette policy peut rester implicite en base au MVP, mais ses regles
doivent etre stables cote service.

### Statuts / transitions

#### Enum `Event.status`

- `DRAFT`
- `PUBLISHED`
- `FULL`
- `CLOSED`
- `ARCHIVED`
- `CANCELLED`

#### Transitions autorisees au MVP `P1`

- `DRAFT -> PUBLISHED`
- `PUBLISHED -> CANCELLED`

#### Transitions reservees mais non obligatoires en implementation `P1`

- `PUBLISHED -> FULL`
- `FULL -> PUBLISHED`
- `PUBLISHED -> CLOSED`
- `FULL -> CLOSED`
- `CLOSED -> ARCHIVED`

#### Regle d'ownership des statuts

- `event-management-service` reste owner du statut canonique `Event`.
- En `P1`, les transitions effectivement executees par le service sont
  surtout `DRAFT`, `PUBLISHED`, `CANCELLED`.
- `FULL` et `CLOSED` sont reserves comme vocabulaire metier et pourront
  etre alimentes plus tard par coordination avec `registration-service`
  ou par regles derivees explicites.

## 2. API surface

### Principes

- Toutes les routes passent par la Gateway sous `/api/events/*`.
- Les routes MVP sont protegees et reservees a `ORGANIZER` ou `ADMIN`,
  sauf lectures internes non exposees publiquement.
- Le service ne sert pas le catalogue public; cela appartient a
  `catalog-search-service`.

### `POST /api/events/drafts`

- Objectif:
  creer un brouillon evenement
- Body:
  - `title`
  - `description`
  - `theme`
  - `venueName`
  - `city`
  - `startAt`
  - `endAt?`
  - `timezone`
  - `capacity`
  - `visibility`
  - `pricingType`
- Reponse de succes:
  `201` avec l'evenement cree en `DRAFT`
- Erreurs attendues:
  - `400` payload invalide
  - `401` non authentifie
  - `403` role insuffisant
  - `422` regle metier invalide
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  non; une intention de creation produit une nouvelle ressource

### `GET /api/events/drafts`

- Objectif:
  lister les brouillons de l'organisateur courant
- Query params:
  - `page`
  - `pageSize`
- Reponse de succes:
  `200` avec liste paginee
- Erreurs attendues:
  - `401`
  - `403`
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui

### `GET /api/events/drafts/{eventId}`

- Objectif:
  lire le detail d'un brouillon ou d'un evenement editable
- Path params:
  - `eventId`
- Reponse de succes:
  `200` avec le detail evenement
- Erreurs attendues:
  - `401`
  - `403` ownership insuffisant
  - `404` ressource introuvable ou non visible
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui

### `PATCH /api/events/drafts/{eventId}`

- Objectif:
  modifier un brouillon
- Path params:
  - `eventId`
- Body:
  tout sous-ensemble modifiable des champs de brouillon
- Reponse de succes:
  `200` avec le brouillon mis a jour
- Erreurs attendues:
  - `400`
  - `401`
  - `403`
  - `404`
  - `422`
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui sur la representation finale envoyee

### `DELETE /api/events/drafts/{eventId}`

- Objectif:
  supprimer logiquement un brouillon non publie
- Path params:
  - `eventId`
- Reponse de succes:
  `204`
- Erreurs attendues:
  - `401`
  - `403`
  - `404`
  - `409` si le statut ne permet plus la suppression
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui dans l'intention; un second appel peut retourner `404`

### `POST /api/events/drafts/{eventId}/publish`

- Objectif:
  publier un brouillon valide
- Path params:
  - `eventId`
- Body:
  - `publishMode`
  - `scheduledAt?`
- Reponse de succes:
  `200` avec `eventId`, `status`, `publishedAt`
- Erreurs attendues:
  - `400`
  - `401`
  - `403`
  - `404`
  - `409` si deja publie
  - `422` si le brouillon est incomplet
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui metier sur un event deja publie; pas de double publication visible

### `GET /api/events/me`

- Objectif:
  alimenter la vue "Mes evenements"
- Query params:
  - `status`
  - `theme`
  - `fromDate`
  - `toDate`
  - `page`
  - `pageSize`
- Reponse de succes:
  `200` avec liste paginee + compteurs
- Erreurs attendues:
  - `401`
  - `403`
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui

### `GET /internal/events/{eventId}/registration-policy`

- Objectif:
  fournir a `registration-service` la policy minimale d'inscription
- Exposition:
  contrat interne service-to-service, hors Gateway publique
- Path params:
  - `eventId`
- Reponse de succes:
  `200` avec `eventId`, `organizerId`, `title`, `city`, `startAt`,
  `capacity`, `visibility`, `status`, `acceptingRegistrations`
- Erreurs attendues:
  - `404` evenement introuvable
  - `409` evenement dans un etat non lisible pour Registration
- Auth requise:
  auth interne service-to-service quand disponible
- Idempotence:
  oui

### `POST /api/events/{eventId}/cancel`

- Objectif:
  annuler un evenement publie ou visible
- Path params:
  - `eventId`
- Body:
  - `reasonCode?`
- Reponse de succes:
  `200` avec `eventId`, `status = CANCELLED`, `cancelledAt`
- Erreurs attendues:
  - `400`
  - `401`
  - `403`
  - `404`
  - `409` si l'evenement n'est pas annulable
- Role ou permission requis:
  `ORGANIZER`, `ADMIN`
- Idempotence:
  oui metier; un event deja `CANCELLED` ne doit pas generer un nouvel
  effet visible

## 3. Evenements asynchrones

### `event.published`

- Nom d'evenement:
  `event.published`
- Producteur:
  `event-management-service`
- Consommateurs attendus:
  - `catalog-search-service`
  - futur `notification-service`
  - futur `admin-service`
- Payload minimal:
  - `eventId`
  - `organizerId`
  - `status`
  - `visibility`
  - `title`
  - `theme`
  - `city`
  - `venueName`
  - `startAt`
  - `publishedAt`
  - `correlationId`
- Conditions d'emission:
  emission unique lors de la transition effective `DRAFT -> PUBLISHED`
- Comportement sur retry:
  les consumers doivent upserter par `eventId`

### `event.cancelled`

- Nom d'evenement:
  `event.cancelled`
- Producteur:
  `event-management-service`
- Consommateurs attendus:
  - `catalog-search-service`
  - `registration-service`
  - futur `notification-service`
  - futur `admin-service`
- Payload minimal:
  - `eventId`
  - `organizerId`
  - `previousStatus`
  - `status`
  - `cancelledAt`
  - `reasonCode`
  - `correlationId`
- Conditions d'emission:
  emission unique lors du passage a `CANCELLED`
- Comportement sur retry:
  les consumers doivent dedupliquer par `messageId`

### `audit.action.recorded`

- Nom d'evenement:
  `audit.action.recorded`
- Producteur:
  `event-management-service`
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
  creation, publication, annulation, suppression logique
- Comportement sur retry:
  idempotent par `messageId`

## 4. Validation & business rules

### Champs obligatoires

- `title`
- `description`
- `theme`
- `venueName`
- `city`
- `startAt`
- `timezone`
- `capacity`
- `visibility`
- `pricingType`

### Contraintes de coherence

- `capacity > 0`
- `endAt` doit etre strictement apres `startAt` si fourni
- `startAt` ne peut pas etre dans un format ou timezone invalide
- `visibility` doit appartenir a `PUBLIC | PRIVATE`
- `pricingType` doit appartenir a `FREE | PAID`

### Regles metier

- tout evenement cree via le flux organisateur commence en `DRAFT`
- seul le proprietaire ou un `ADMIN` peut lire/modifier/publier/annuler
  l'evenement
- un brouillon incomplet ne peut pas etre publie
- un evenement `CANCELLED` ne peut pas etre republie tel quel au MVP
- un evenement deja publie n'est plus supprimable physiquement via
  `DELETE /drafts/{id}`

### Regles inter-services

- le service ne pousse jamais directement dans la base du catalogue
- la visibilite publique du catalogue derive de `event.published`
- l'acceptation des inscriptions apres annulation doit etre bloquee cote
  `registration-service` apres consommation de `event.cancelled`

### Concurrence / unicite

- un `eventId` est unique
- la publication doit etre atomique pour eviter deux emissions
  `event.published`
- l'annulation doit etre atomique pour eviter plusieurs emissions
  `event.cancelled`

## 5. Securite & audit

### Type d'auth

- Auth obligatoire via Gateway
- Le service ne revalide pas le JWT complet, mais consomme les headers
  de contexte approuves par la Gateway

### Roles / permissions

- `ORGANIZER`
  - creer un brouillon
  - gerer uniquement ses propres evenements
- `ADMIN`
  - acces transverse reserve pour suites moderation/admin
- `PARTICIPANT`
  - aucun acces aux routes de gestion evenement

### Actions a journaliser

- create draft
- update draft
- delete draft
- publish event
- cancel event
- echec d'acces ownership ou ACL si utile a l'investigation

### Donnees sensibles a proteger

- aucune donnee secret-type dans `Event`
- ne pas exposer de metadonnees internes non publiques via des routes
  destinees au catalogue

## 6. Observabilite

### Health checks

- `GET /health`
- `GET /ready`

### Logs structures

Champs minimums:

- `service = event-management-service`
- `route`
- `method`
- `eventId` si connu
- `organizerId` si connu
- `result`
- `correlationId`

### Metriques metier minimales

- nombre de drafts crees
- nombre de publications reussies / refusees
- nombre d'annulations
- latence des endpoints de gestion evenement

### Correlation-id

- lecture du `x-correlation-id` entrant
- propagation dans les logs et events async emis

## 7. Integrations externes

### API Gateway

- mode:
  synchrone
- usage:
  exposition des routes, auth, propagation contexte utilisateur

### `catalog-search-service`

- mode:
  async
- usage:
  consommation de `event.published` et `event.cancelled`

### `registration-service`

- mode:
  sync + async
- usage:
  - lecture synchrone de
    `GET /internal/events/{eventId}/registration-policy`
  - consommation de `event.cancelled`

### Media

- mode:
  reserve en `P1/P2`
- usage:
  `coverImageRef` et futures integrations image

## 8. Tests minimaux

### Smoke routes principales

- `POST /api/events/drafts`
- `GET /api/events/drafts`
- `PATCH /api/events/drafts/{eventId}`
- `POST /api/events/drafts/{eventId}/publish`
- `GET /api/events/me`
- `POST /api/events/{eventId}/cancel`

### Tests `401/403/200`

- organisateur authentifie sur son event -> `200`
- organisateur sur l'event d'un autre -> `403`
- participant sur route de draft -> `403`
- absence de token -> `401`

### Tests des transitions critiques

- `DRAFT -> PUBLISHED`
- `PUBLISHED -> CANCELLED`
- refus de `DRAFT -> PUBLISHED` si payload incomplet
- refus d'annulation si etat non annulable

### Tests de non-regression metier

- un brouillon publie n'apparait plus comme simple brouillon editable
- la publication n'emet qu'un `event.published`
- l'annulation n'emet qu'un `event.cancelled`
- le listing `GET /api/events/me` ne retourne que les evenements du
  proprietaire courant

## 9. Definition of Done

- spec completee et alignee avec `docs/api-contracts-p1.md`
- ownership `Event` et ACL organisateur explicites
- transitions `DRAFT`, `PUBLISHED`, `CANCELLED` verrouillees pour `P1`
- contrats async `event.published` et `event.cancelled` stabilises
- base suffisante pour ouvrir `feature/event-draft-crud`,
  `feature/event-publish-now`, `feature/organizer-events-list-api` et
  `feature/event-cancel-flow`
