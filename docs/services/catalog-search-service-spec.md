# Catalog & Search Service - Spec P1

> Lire `docs/workflows/Workflow_backend.md` avant implementation.

## 0. Meta

- **Service name**
  `catalog-search-service`

- **Business domain**
  Exposer le catalogue public des evenements publies, appliquer les
  filtres de recherche `P1`, servir le detail public et maintenir une
  projection de lecture derivee de `event-management-service`.

- **Phase cible**
  `P1`

- **Backlog refs**
  `F01.2`, `F01.3`, `E04.3`

- **Sprint de cadrage**
  `Sprint 0`

## 1. Domain model

### Entites principales

#### `CatalogEventView`

- Champs clefs:
  `eventId`, `title`, `theme`, `venueName`, `city`, `startAt`,
  `visibility`, `status`, `excerpt`, `coverImageUrl`, `publishedAt`,
  `lastSyncedAt`
- Relations:
  projection de lecture derivee de `Event`
- Source de verite:
  `catalog-search-service` pour la projection de lecture;
  `event-management-service` pour la donnee evenement source

Usage:

- listing public des evenements
- detail public evenement
- filtres texte/theme/date/ville

#### `CatalogQuery`

- Champs clefs:
  `q`, `theme`, `city`, `from`, `to`, `page`, `pageSize`
- Relations:
  contrat de recherche applique a `CatalogEventView`
- Source de verite:
  contrat API `catalog-search-service`

### Statuts / transitions

#### Enum `CatalogEventView.status`

- `PUBLISHED`
- `FULL`
- `CLOSED`
- `CANCELLED`

#### Transitions autorisees au MVP `P1`

- ingestion `event.published` -> `PUBLISHED`
- ingestion `event.cancelled` -> `CANCELLED`

#### Transitions reservees mais non obligatoires en implementation `P1`

- `PUBLISHED -> FULL`
- `FULL -> CLOSED`

#### Regle d'ownership

- `catalog-search-service` est owner de la projection publique et des
  regles de recherche.
- `event-management-service` reste owner du cycle de vie canonique de
  l'evenement.
- `catalog-search-service` ne decide jamais si un evenement est editable,
  publiable ou annulable.

## 2. API surface

### Principes

- Les routes externes passent par la Gateway sous `/api/catalog/*`.
- Les lectures publiques sont anonymes par defaut.
- Les routes catalogue ne revelent jamais un brouillon, un evenement
  prive ou une ressource retiree du portail public.

### `GET /api/catalog/events`

- Objectif:
  lister les evenements publics visibles avec filtres `P1`
- Query params:
  - `q?`
  - `theme?`
  - `city?`
  - `from?`
  - `to?`
  - `page`
  - `pageSize`
- Reponse de succes:
  `200` avec `items`, `page`, `pageSize`, `total`
- Erreurs attendues:
  - `400` filtre invalide
- Role ou permission requis:
  public
- Idempotence:
  oui

### `GET /api/catalog/events/{eventId}`

- Objectif:
  lire la fiche publique d'un evenement visible
- Path params:
  - `eventId`
- Reponse de succes:
  `200` avec le detail public
- Erreurs attendues:
  - `404` evenement absent ou non visible publiquement
- Role ou permission requis:
  public
- Idempotence:
  oui

## 3. Evenements asynchrones

Le service ne produit pas d'evenement metier `P1` obligatoire. Il
consomme les changements de cycle de vie provenant d'Event Management.

### `event.published` consume

- Producteur:
  `event-management-service`
- Consommateur:
  `catalog-search-service`
- Effet attendu:
  - upsert de `CatalogEventView` par `eventId`
  - rendu public de l'evenement si `visibility = PUBLIC`
  - rafraichissement des champs de recherche et de detail
- Comportement sur retry:
  traitement idempotent par `eventId` et `messageId`

### `event.cancelled` consume

- Producteur:
  `event-management-service`
- Consommateur:
  `catalog-search-service`
- Effet attendu:
  - marquer la projection locale en `CANCELLED`
  - retirer l'evenement des listes publiques
  - faire retourner `404` sur le detail public une fois la projection
    reindexee
- Comportement sur retry:
  traitement idempotent par `eventId` et `messageId`

### `audit.action.recorded`

- Nom d'evenement:
  `audit.action.recorded`
- Producteur:
  `catalog-search-service`
- Consommateurs attendus:
  futur `admin/audit-store`
- Payload minimal:
  - `actorId = SYSTEM`
  - `actorRole = SYSTEM`
  - `action`
  - `targetType = CATALOG_EVENT_VIEW`
  - `targetId`
  - `result`
  - `occurredAt`
  - `correlationId`
- Conditions d'emission:
  uniquement sur echec critique de projection ou rejeu manuel
  d'administration quand ce besoin existera
- Comportement sur retry:
  dedoublonnage par `messageId`

## 4. Validation & business rules

### Regles d'entree

- `page >= 1`
- `1 <= pageSize <= 100`
- `from` et `to` doivent etre des dates `ISO 8601` valides
- `eventId` doit etre un identifiant opaque valide

### Regles de visibilite publique

- seuls les evenements `PUBLIC` sont eligibles au catalogue `P1`
- un evenement `DRAFT` n'apparait jamais en lecture publique
- un evenement `CANCELLED` n'apparait plus dans les listes publiques
- le detail public retourne `404` si l'evenement n'est pas
  publiquement lisible

### Regles de recherche

- `q` filtre sur le titre et l'extrait public
- `theme` et `city` sont compares sur des valeurs normalisees
- `from` et `to` filtrent `startAt`
- l'ordre par defaut est:
  - `startAt` croissant
  - `publishedAt` decroissant
  - `eventId` croissant pour stabiliser la pagination

### Regles de projection

- `event.published` doit etre traite en upsert
- un replay de `event.published` ne doit pas dupliquer la ressource
- `event.cancelled` doit rendre la projection non searchable sans
  suppression physique aveugle
- la projection conserve `lastSyncedAt` pour mesurer le lag
- `coverImageUrl` peut rester null tant que le contrat media `P1` n'est
  pas stabilise

## 5. Securite & audit

### Type d'auth

- aucune auth obligatoire pour les routes publiques du catalogue
- les appels internes d'operabilite restent limites au reseau interne

### Roles / permissions

- public
  - lister les evenements visibles
  - lire le detail public
- `ORGANIZER`, `PARTICIPANT`, `ADMIN`
  - utilisent les memes lectures publiques sans privileges additionnels

### Actions a journaliser

- ingestion reussie de `event.published`
- ingestion reussie de `event.cancelled`
- erreur de projection non recuperable
- filtre de recherche invalide expose en `400`

### Donnees sensibles a proteger

- aucune donnee participant, organisateur privee ou interne ne doit
  sortir dans le catalogue
- ne jamais exposer `organizerId` ni champs de moderation internes
- ne jamais exposer un asset media prive ou non resolu via une URL brute
  sensible

## 6. Observabilite

### Health checks

- `GET /health`
- `GET /ready`

### Logs structures

Champs minimums:

- `service = catalog-search-service`
- `route`
- `method`
- `eventId` si connu
- `messageId` si consommation async
- `filtersHash` pour les requetes liste si utile
- `result`
- `correlationId`

### Metriques metier minimales

- latence `GET /api/catalog/events`
- latence `GET /api/catalog/events/{eventId}`
- taille moyenne des pages retournees
- nombre de projections actives
- nombre d'events `event.published` traites
- nombre d'events `event.cancelled` traites
- lag de projection entre `occurredAt` et `lastSyncedAt`

### Correlation-id

- lecture du `x-correlation-id` depuis la Gateway pour les routes sync
- propagation du `correlationId` des events async dans les logs

## 7. Integrations externes

### API Gateway

- mode:
  synchrone
- usage:
  exposition des routes publiques et normalisation des erreurs

### Event Management

- mode:
  async
- usage:
  consommation de `event.published` et `event.cancelled`

### Media

- mode:
  reserve `P1`
- usage:
  resolution future de `coverImageUrl` si le contrat media ajoute un
  champ public stable

## 8. Tests minimaux

### Smoke routes principales

- `GET /api/catalog/events`
- `GET /api/catalog/events/{eventId}`

### Tests `400/404/200`

- filtre date invalide -> `400`
- detail sur brouillon/non public -> `404`
- detail sur evenement publie public -> `200`

### Tests des transitions critiques

- `event.published` cree ou met a jour la projection
- `event.cancelled` retire la ressource des lectures publiques
- replay de `event.published` reste idempotent

### Tests de non-regression metier

- la pagination reste stable entre deux appels identiques
- `theme`, `city`, `from`, `to`, `q` peuvent etre combines
- un evenement prive n'apparait jamais en liste
- `coverImageUrl` absent ne casse ni la liste ni le detail

## 9. Definition of Done

- spec completee et alignee avec `docs/api-contracts-p1.md`
- ownership de la projection publique explicite
- consommation async `event.published` / `event.cancelled` stabilisee
- filtres et regles de visibilite publique figes
- observabilite minimale et idempotence de projection documentees
- base suffisante pour ouvrir `feature/catalog-public-list-api` et
  `feature/catalog-event-detail-api`
