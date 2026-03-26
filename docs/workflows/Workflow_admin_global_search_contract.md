# Workflow admin - Global search contract (Sprint 3)

Ce document stabilise le contrat de recherche globale admin
utilisateur/evenement (ticket `A04.1`).

## 1. Objectif

- Definir une recherche multicriteres unique pour les admins.
- Standardiser les filtres, la forme des resultats et la pagination.
- Permettre la navigation vers les fiches cibles depuis la console.

## 2. Perimetre

- Actor principal: `ADMIN` (US12).
- Cibles de recherche MVP:
  `USER` et `EVENT`.
- Hors-scope:
  recherche full text avancee type moteur externe et scoring IA.

## 3. Ownership et boundaries

- Source de verite metier:
  `identity-access-service` pour les comptes,
  `event-management-service` pour les evenements.
- Projection/search read model:
  `admin-search-service` (ou module dedie admin) owner de l'index de
  recherche.
- Alimentation:
  sync initial + async incrementale via events metier.

## 4. API contract

### 4.1 `GET /api/admin/search`

- Objectif:
  recherche globale sur plusieurs types de cibles.
- Query params:
  - `q?` texte libre
  - `type?` = `USER|EVENT|ALL` (default `ALL`)
  - `status?` (contextuel au type)
  - `role?` (type `USER`)
  - `city?` (type `EVENT`)
  - `from?`, `to?` (date range)
  - `createdFrom?`, `createdTo?`
  - `page` (>= 1)
  - `pageSize` (1..100)
  - `sortBy?` (default `updatedAt`)
  - `sortOrder?` (`asc|desc`, default `desc`)

- Reponse succes:
  `{ success: true, data: SearchResultItem[], meta }`

- Erreurs:
  - `400` filtre invalide
  - `401` non authentifie
  - `403` role non admin

### 4.2 `GET /api/admin/search/suggestions`

- Objectif:
  proposer autocomplete sur `q`.
- Query:
  `q`, `type?`, `limit?` (default 5, max 20)
- Reponse:
  `{ success: true, data: SuggestionItem[] }`

## 5. Schema resultat commun

`SearchResultItem`:

- `type`: `USER|EVENT`
- `id`: identifiant cible
- `title`: libelle principal
- `subtitle`: complement lisible
- `status`: statut normalise
- `updatedAt`: ISO timestamp
- `highlights`: tableau string optionnel
- `navigation`:
  - `route`: URL cible admin
  - `label`: texte CTA

Exemples de `navigation.route`:

- user: `/admin/search/users/{id}`
- event: `/admin/search/events/{id}`

## 6. Filtres obligatoires cote admin UI

- texte libre `q`
- type cible
- plage de dates
- statut
- role (si `USER`)
- ville (si `EVENT`)

Regles:

- tous les filtres sont combinables;
- `type` pilote les filtres visibles dans l'UI;
- si `type=ALL`, appliquer uniquement les filtres transverses.

## 7. Regles de permission et visibilite

- route reservee `ADMIN`.
- aucun champ sensible ne doit sortir:
  - password hash, tokens, secrets, PII brute inutile.
- redaction des donnees non necessaires dans `subtitle/highlights`.

## 8. Sync vs async

- query admin:
  synchrone (`GET /api/admin/search`).
- alimentation index:
  asynchrone depuis events de changements `USER` et `EVENT`.
- fallback degradation:
  si index stale, retourner resultats avec flag `meta.degraded=true`.

## 9. Observabilite

- logs:
  `queryHash`, `filters`, `resultCount`, `durationMs`, `correlationId`.
- metriques:
  `admin_search_queries_total`,
  `admin_search_latency_ms`,
  `admin_search_index_lag_ms`.
- audit:
  enregistrer `ADMIN_SEARCH_EXECUTED` pour les recherches sensibles.

## 10. Critere d'acceptation du contrat

- criteres de recherche user/event figes.
- format de resultat commun valide pour UI `A04.3`.
- pagination/tri/erreurs standardises.
- regles ACL et redaction explicites.
