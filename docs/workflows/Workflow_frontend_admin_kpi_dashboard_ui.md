# Workflow frontend - Admin KPI dashboard UI (Sprint 3)

Ce document decrit l'integration UI du dashboard KPI admin
(ticket `A05.3`) sur `/admin/kpi`.

## 1. Objectif

- Afficher les KPI MVP admin sous forme de cards exploitables.
- Aligner le rendu UI sur le catalogue `A05.1` et l'API `A05.2`.
- Exposer clairement la fraicheur et l'etat des donnees.

## 2. Dependances

- `A01.2`: shell admin
- `A01.3`: guard admin route
- `A05.1`: catalogue KPI
- `A05.2`: backend `admin-kpi-service`

## 3. Routing et acces

- route principale: `/admin/kpi`
- acces reserve `ADMIN` via `useAdminGuard()`

Comportements:

- non-auth: redirect `/auth/login?next=/admin/kpi`
- non-admin: `StateForbidden`

## 4. Structure de page

Composants:

- `KpiDashboardHeader` (titre, fenetre active, last refresh)
- `KpiWindowSelector` (`D1`, `D7`, `D30`)
- `KpiCardsGrid`
- `KpiHealthBanner` (etat global de la source)
- `KpiRefreshAction` (manual refresh optionnel)

Etats UI:

- `StateLoading` au premier chargement
- `StateError` si echec API
- `StateEmpty` si aucune carte disponible

## 5. Mapping API frontend

Chargement principal:

- `GET /api/admin/kpi?window=<D1|D7|D30>`

Detail carte optionnel:

- `GET /api/admin/kpi/{kpiId}?window=<...>`

Health optionnel:

- `GET /api/admin/kpi/health`

Reponse exploitee:

- `kpiId`, `value`, `unit`, `window`, `computedAt`, `dataStatus`

## 6. Cartes KPI MVP

Cards minimales:

- `KPI-ADM-01` evenements publies
- `KPI-ADM-02` taux de remplissage moyen
- `KPI-ADM-03` attente active
- `KPI-ADM-04` promotions waitlist
- `KPI-ADM-05` notifications en echec

Chaque card affiche:

- label KPI
- valeur formatee
- unite
- fenetre active
- `computedAt`
- badge `dataStatus`

## 7. Regles de rendu `dataStatus`

- `OK`: badge neutre/succes
- `DEGRADED`: badge warning + message "Source partielle"
- `DELAYED`: badge warning fort + message "Donnees non fraiches"

Regle UX:

- ne jamais masquer une card si valeur precedente existe
- afficher la derniere valeur connue + badge et message

## 8. Formatting et UX

- valeur taux (`KPI-ADM-02`) affichee en pourcentage avec 1 decimale
- valeurs de comptage formatees sans decimales
- conserver une grille stable entre mobile et desktop
- etat "refreshing" non bloquant sur refresh manuel

## 9. Gestion erreurs

- `400`: fenetre invalide -> fallback `D7` + message
- `401`: redirect login
- `403`: `StateForbidden`
- `5xx`: `StateError` + `correlationId` si present

## 10. Observabilite frontend

Events UI:

- `admin.kpi.dashboard.viewed`
- `admin.kpi.window.changed`
- `admin.kpi.refresh.requested`
- `admin.kpi.refresh.succeeded`
- `admin.kpi.refresh.failed`

Payload minimal:

- `window`
- `cardsCount`
- `degradedCount`
- `delayedCount`
- `correlationId` (si disponible)

## 11. Tests UI minimaux

- guard admin sur `/admin/kpi`
- changement de fenetre recharge les donnees
- rendu des 5 cards KPI MVP
- mapping correct des badges `OK/DEGRADED/DELAYED`
- erreur `403` -> `StateForbidden`
- erreur `5xx` -> `StateError` avec correlation id
