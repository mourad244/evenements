# Workflow frontend - Admin route guards (Sprint 3)

Ce document definit le guard admin pour les routes console afin de
securiser l'acces aux ecrans sensibles (ticket `A01.3`).

## 1. Objectif

- Bloquer l'acces aux routes admin pour tout utilisateur non `ADMIN`.
- Standardiser le comportement `unauth` vs `forbidden`.
- Rendre le guard reutilisable dans toutes les vues admin.

## 2. Portee

- Routes console admin uniquement.
- Le guard UI consomme un etat session existant.
- Hors-scope: logic backend d'autorisation.

## 3. Routes admin protegees

Liste issue de `A01.1`:

- `/admin/moderation`
- `/admin/audit`
- `/admin/kpi`
- `/admin/incidents`
- `/admin/search`
- `/admin/notifications`

## 4. Source de verite role

Le guard consomme la session UI:

- `session.isAuthenticated`
- `session.user.roles` contient `ADMIN`

Si un cache local existe, il doit etre rafraichi apres login.

## 5. Regles de redirection

1. **Non authentifie**: rediriger vers
   `/auth/login?next=/admin/...`.
2. **Authentifie mais pas admin**:
   - afficher `StateForbidden`
   - proposer un lien `Retour accueil`
   - journaliser l'evenement `admin.forbidden`

## 6. Etats UI standard

Reutiliser `Workflow_frontend_shared_states.md`:

- `StateLoading` pendant la verification session.
- `StateForbidden` pour acces refuse.
- `StateError` si la session est invalide (avec `correlationId`).

## 7. Hook / utilitaire recommande

Pseudo API:

- `useAdminGuard()` retourne `{ status, redirectTo }`
- `status`: `loading | allowed | forbidden | unauth`

Le layout admin applique le guard en amont de toutes les pages.

## 8. Tests attendus

- Non auth -> redirect login + `next`.
- Auth non admin -> `StateForbidden`.
- Auth admin -> acces page.
