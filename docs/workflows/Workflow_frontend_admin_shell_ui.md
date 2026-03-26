# Workflow frontend - Admin shell UI (Sprint 3)

Ce document decrit le layout et la navigation de la console admin afin
de permettre une implementation UI coherente (ticket `A01.2`).

## 1. Objectif

- Fournir un shell admin implementable (layout, navigation, etats).
- Assurer la reutilisation des etats UI standards.
- Preparer les vues moderation, audit, recherche, KPI, incidents.

## 2. Perimetre

- Console admin uniquement (role `ADMIN`).
- Hors-scope: logique backend, contracts d'audit, moderation, KPI.

## 3. Layout global

Structure cible:

- `AdminShell`
  - `AdminHeader` (logo, environment tag, user menu, quick actions)
  - `AdminNav` (navigation laterale)
  - `AdminMain`
    - `AdminPageHeader` (title, breadcrumbs, actions)
    - `AdminContent` (tables, cards, forms, details)
  - `AdminFooter` (version, build info, support)

Regles:

- La navigation laterale reste visible sur desktop.
- Sur mobile, `AdminNav` devient un drawer.
- Le `AdminPageHeader` expose les actions de page (refresh, export).

## 4. Navigation & routes

Routes issues de `A01.1`:

- Moderation: `/admin/moderation`
- Audit: `/admin/audit`
- KPI: `/admin/kpi`
- Incidents: `/admin/incidents`
- Recherche: `/admin/search`
- Notifications: `/admin/notifications`

Le shell admin doit afficher la route active et les badges d'etat
si disponibles (ex: `INCIDENTS` avec compteur).

## 5. Etats UI standard

Reutiliser les conventions de `Workflow_frontend_shared_states.md`:

- `StateLoading` pour les tables/boards.
- `StateEmpty` pour listes sans resultats.
- `StateError` avec `correlationId` visible si present.
- `StateForbidden` pour tout ecran non autorise.

## 6. Composants transverses

- `AdminTable` avec pagination, tri, actions ligne.
- `AdminFilters` (chips + champs texte).
- `AdminSearchBar` global (recherche rapide).
- `AdminStatusBadge` pour statuts moderation/audit.
- `ConfirmModal` pour actions sensibles (approve/reject).

## 7. Accessibilite & responsive

- Focus visible sur toutes les actions.
- Navigation clavier pour tables (row actions, menus).
- Layout single-column sur mobile (< 768px).

## 8. Points d'observabilite UI

- Afficher `correlationId` dans les erreurs admin.
- Journaliser les actions admin cote frontend (event name + entityId).
