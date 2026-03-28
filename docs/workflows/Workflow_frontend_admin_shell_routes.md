# Workflow frontend - admin shell routes `Sprint 0`

Ce document stabilise les routes de la console admin pour `A01.1`.

Dependances:

- `F04.1` contrat ACL frontend
- backlog `A01` (shell admin)

## 1. Objectif

Fixer la structure de navigation admin avant implementation UI (`Sprint 3`)
pour:

- moderation
- audit
- KPI
- incidents

## 2. Convention de base de routes

- prefixe unique: `/admin/*`
- layout dedie: `AdminLayout`
- route d'entree: `/admin` (redirige vers `/admin/moderation`)

## 3. Matrice des routes admin

| Route | Acces | Ecran cible | Dependance backlog |
| --- | --- | --- | --- |
| `/admin` | `ADMIN` | redirect vers moderation | `A01.1` |
| `/admin/moderation` | `ADMIN` | file moderation | `A02.3` |
| `/admin/audit` | `ADMIN` | recherche audit | `A03.3` |
| `/admin/search` | `ADMIN` | recherche globale | `A04.3` |
| `/admin/kpi` | `ADMIN` | dashboard KPI | `A05.3` |
| `/admin/incidents` | `ADMIN` | chronologie incident | `A06.3` |
| `/admin/notifications` | `ADMIN` | logs notifications | `N06.3` |

## 4. Regles de guard

- non authentifie:
  redirection vers `/auth/login?next=<encodedAdminRoute>`
- role different de `ADMIN`:
  ecran `403` (pas de downgrade vers organizer/participant)
- token expire:
  tentative refresh, puis logout + redirection login si refresh KO

## 5. Navigation console

Sections principales du menu:

- Moderation
- Audit
- Search
- KPI
- Incidents
- Notifications

Header admin:

- contexte role `ADMIN`
- bouton logout
- indicateur etat session

## 6. Etats UI minimums par ecran

Pour chaque route admin:

- `loading`
- `empty`
- `error`
- `forbidden`
- `success` feedback

## 7. Hors scope de `A01.1`

- implementation visuelle complete des pages admin
- logique metier moderation/audit/search/kpi/incidents
- aggregation backend KPI

## 8. Sortie attendue

`A01.1` est valide quand:

- les routes moderation, audit, KPI, incident sont figees
- la navigation admin est stabilisee
- les regles guard/redirect sont explicites et coherentes avec `F04.1`
