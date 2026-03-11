# Workflow frontend - Admin audit UI (Sprint 3)

Ce document decrit l'integration UI de la recherche audit admin
(ticket `A03.3`) a partir des contrats `A03.1` et `A03.2`.

## 1. Objectif

- Permettre la recherche de traces d'audit par acteur, action, cible et
  date.
- Exposer une vue liste + detail avec pagination.
- Assurer la coherence des etats UI et des permissions admin.

## 2. Dependances

- `A01.2`: shell admin (`/admin/audit`)
- `A01.3`: guard admin route
- `A03.1`: contrat audit transverse
- `A03.2`: API backend `admin-audit-service`

## 3. Route et acces

- Route: `/admin/audit`
- Option detail: `/admin/audit/:auditId`
- Guard: `useAdminGuard()` obligatoire

Comportements:

- non authentifie: redirect `/auth/login?next=/admin/audit`
- authentifie non admin: `StateForbidden`

## 4. Structure de la page audit

Composants principaux:

- `AuditFiltersBar`
- `AuditResultsTable`
- `AuditPagination`
- `AuditLogDetailDrawer` (ou page detail)

Etat de page:

- `StateLoading` pendant chargement
- `StateEmpty` si aucun resultat
- `StateError` si erreur API (avec `correlationId`)

## 5. Filtres UI obligatoires

Filtres exposes:

- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `result`
- `sourceService`
- `from` / `to`
- `correlationId`

Regles UX:

- bouton `Apply filters`
- bouton `Reset`
- debouncing possible uniquement sur `actorId` et `targetId`

## 6. Colonnes de la table

Colonnes minimales:

- `occurredAt`
- `sourceService`
- `actorId`
- `actorRole`
- `action`
- `targetType`
- `targetId`
- `result`
- `correlationId`

Actions ligne:

- `View details` (ouvre drawer/detail)

## 7. Mapping API

Listage:

- `GET /api/admin/audit/logs` avec filtres + `page`, `pageSize`,
  `sortBy`, `sortOrder`

Detail:

- `GET /api/admin/audit/logs/{auditId}`

Reponse attendue:

- `{ success: true, data, meta }`

## 8. Gestion erreurs

- `400`: filtre invalide -> message "Filtres invalides"
- `401`: session expiree -> redirect login
- `403`: acces refuse -> `StateForbidden`
- `404` (detail): "Trace introuvable"
- `5xx`: message generique + `correlationId` si present

## 9. Observabilite frontend

Events frontend:

- `admin.audit.search.requested`
- `admin.audit.search.succeeded`
- `admin.audit.search.failed`
- `admin.audit.detail.opened`

Chaque event inclut:

- `correlationId` (si present)
- `filtersHash` (sans PII brute)

## 10. Tests UI minimaux

- Guard admin:
  - non-auth redirige
  - non-admin voit `StateForbidden`
- Recherche:
  - appel API avec filtres correctement serialises
  - pagination conserve les filtres
- Table:
  - affichage des colonnes minimales
  - action detail ouvre la bonne trace
- Erreurs:
  - `400`, `403`, `404`, `5xx` rendus conformes
