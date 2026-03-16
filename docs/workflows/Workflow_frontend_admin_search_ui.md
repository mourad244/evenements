# Workflow frontend - Admin search UI (Sprint 3)

Ce document decrit l'integration UI de la recherche globale admin
(ticket `A04.3`) sur `/admin/search`.

## 1. Objectif

- Offrir une recherche multicriteres sur users et events.
- Permettre l'ouverture directe de la fiche cible depuis les resultats.
- Aligner la vue UI avec les contrats `A04.1` et `A04.2`.

## 2. Dependances

- `A01.2`: shell admin
- `A01.3`: guard admin routes
- `A04.1`: contrat global search
- `A04.2`: backend `admin-search-service`

## 3. Routing et acces

- page principale: `/admin/search`
- detail user: `/admin/search/users/:id`
- detail event: `/admin/search/events/:id`

Guard:

- `useAdminGuard()` obligatoire
- non-auth -> redirect login avec `next`
- non-admin -> `StateForbidden`

## 4. Structure de la page

Composants:

- `AdminSearchHeader` (titre + resume recherche)
- `AdminSearchFilters`
- `AdminSearchResultsTable`
- `AdminSearchPagination`
- `AdminSearchSuggestions` (optionnel)

Etats UI:

- `StateLoading` pendant fetch
- `StateEmpty` si 0 resultat
- `StateError` si echec API
- `StateForbidden` si acces refuse

## 5. Filtres exposes

Filtres minimaux:

- `q` texte libre
- `type`: `ALL|USER|EVENT`
- `status`
- `role` (visible si `USER` ou `ALL`)
- `city` (visible si `EVENT` ou `ALL`)
- `from`, `to`
- `createdFrom`, `createdTo`

Regles UX:

- bouton `Search`
- bouton `Reset`
- persistance des filtres dans l'URL query string
- `page` reset a `1` quand filtre change

## 6. Mapping API frontend

Listage:

- `GET /api/admin/search`
- query serialisee depuis filtres + pagination/tri

Suggestions:

- `GET /api/admin/search/suggestions` sur `q` (debounce 250ms)

Detail:

- `GET /api/admin/search/{type}/{entityId}` si ouverture rapide requise

## 7. Colonnes resultats

Colonnes minimales:

- `type`
- `title`
- `subtitle`
- `status`
- `updatedAt`
- `navigation` (CTA `Open`)

Comportement:

- click `Open` redirige vers `navigation.route`
- routing fallback si `navigation.route` absent

## 8. Tri, pagination, URL state

- tri par defaut:
  `updatedAt desc`
- pagination:
  `page`, `pageSize` (10/20/50)
- URL synchronisee:
  partage d'URL reproduit meme resultat/filtres

## 9. Gestion erreurs

- `400` -> afficher erreurs de filtres valides
- `401` -> redirect login
- `403` -> `StateForbidden`
- `404` detail -> "Ressource introuvable"
- `5xx` -> message generique + `correlationId` si present

## 10. Observabilite frontend

Events UI:

- `admin.search.requested`
- `admin.search.succeeded`
- `admin.search.failed`
- `admin.search.result_opened`

Payload minimal:

- `filtersHash`
- `resultCount`
- `durationMs`
- `correlationId` (si disponible)

## 11. Tests UI minimaux

- guard admin sur `/admin/search`
- rendu conditionnel des filtres `role/city` selon `type`
- serialisation query string -> API call correcte
- pagination conserve les filtres
- action `Open` ouvre la bonne cible user/event
- rendu erreurs `400/403/5xx` conforme
