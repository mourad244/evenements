# Workflow frontend - contrat ACL et guards `Sprint 0`

Ce document fige le contrat frontend de guards et de redirections pour
`F04.1`.

Objectif:

- stabiliser la matrice de roles frontend (`public`, `participant`,
  `organizer`, `admin`)
- fixer les comportements de redirection pour routes protegees
- aligner les etats auth UI avec les codes backend

## 1. Roles frontend cibles

- `ANONYMOUS`: utilisateur non authentifie
- `PARTICIPANT`
- `ORGANIZER`
- `ADMIN`

Source de verite role:

- claim JWT `role` valide par la Gateway
- contexte session frontend derive de `/api/auth/me`

## 2. Types de routes

- `public`: accessible sans session
- `participant-only`: reserve `PARTICIPANT`
- `organizer-only`: reserve `ORGANIZER` et `ADMIN`
- `admin-only`: reserve `ADMIN`
- `authenticated`: session valide, role parmi
  `PARTICIPANT|ORGANIZER|ADMIN`

## 3. Matrice ACL par route shell

| Route | Type | Roles autorises | Si non authentifie | Si role invalide |
| --- | --- | --- | --- | --- |
| `/` | public | tous | n/a | n/a |
| `/events` | public | tous | n/a | n/a |
| `/events/:eventId` | public | tous | n/a | n/a |
| `/auth/login` | public | tous | afficher login | si deja connecte: redirect dashboard role |
| `/auth/register` | public | tous | afficher register | si deja connecte: redirect dashboard role |
| `/participant/dashboard` | participant-only | `PARTICIPANT` | redirect `/auth/login?next=<route>` | page `403` |
| `/participant/participations` | participant-only | `PARTICIPANT` | redirect `/auth/login?next=<route>` | page `403` |
| `/organizer/events` | organizer-only | `ORGANIZER`, `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/organizer/events/new` | organizer-only | `ORGANIZER`, `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/organizer/events/:eventId/edit` | organizer-only | `ORGANIZER`, `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/organizer/events/:eventId/registrations` | organizer-only | `ORGANIZER`, `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/admin/moderation` | admin-only | `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/admin/audit` | admin-only | `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/admin/kpi` | admin-only | `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |
| `/admin/incidents` | admin-only | `ADMIN` | redirect `/auth/login?next=<route>` | page `403` |

## 4. Etats auth et transitions UI

| Etat frontend | Description | Trigger principal | Action UI |
| --- | --- | --- | --- |
| `UNAUTHENTICATED` | pas de session active | chargement app sans token valide | acces public only, guards actifs |
| `AUTHENTICATED` | session valide + role connu | login/refresh/me OK | acces route selon matrice |
| `SESSION_EXPIRED` | access token invalide/expire | API `401` sur route protegee | tentative refresh, sinon logout + redirect login |
| `FORBIDDEN` | role valide mais non autorise | API `403` ou guard local role mismatch | page `403` + lien retour |
| `UNKNOWN` | bootstrap en cours | startup app + `me` pending | ecran loading de shell |

## 5. Regles de redirection obligatoires

- Route protegee sans session:
  redirect `/auth/login?next=<encodedRoute>`
- Login/recovery reussi:
  retour vers `next` si autorise, sinon dashboard role
- Session expiree apres refresh KO:
  clear session locale + redirect login
- Route role-mismatch:
  conserver URL demandee et afficher `403`

## 6. Mapping erreurs backend -> UX

| Code backend | Sens | UX attendue |
| --- | --- | --- |
| `401` (`UNAUTHORIZED`, `INVALID_TOKEN`) | session absente/invalide | redirect login + message session |
| `403` (`FORBIDDEN`) | role non autorise | ecran acces refuse |
| `404` | ressource absente/non visible | page not-found metier |
| `409`, `422` | conflit/validation metier | message formulaire contextualise |
| `502` | upstream indisponible | banner indisponibilite + retry |

## 7. Pseudo-API guard (reference implementation)

```ts
type Role = "PARTICIPANT" | "ORGANIZER" | "ADMIN";
type SessionState = "UNAUTHENTICATED" | "AUTHENTICATED" | "SESSION_EXPIRED";
type GuardResult =
  | { allow: true }
  | { allow: false; action: "REDIRECT_LOGIN" | "SHOW_403"; next?: string };
```

Regles:

- `public`: always allow
- `participant-only`: allow iff role `PARTICIPANT`
- `organizer-only`: allow iff role `ORGANIZER|ADMIN`
- `admin-only`: allow iff role `ADMIN`

## 8. Alignement avec tests ACL

Le frontend doit rester coherent avec:

- `docs/test-plan-role-regression.md`
- `docs/api-contracts-p1.md` (codes `401/403` et routes protegees)

## 9. Sortie `F04.1`

`F04.1` est considere valide quand:

- cette matrice ACL est figee et partagee front/back
- les redirections `login/403` sont non ambiguës
- `F04.2` et `F04.3` peuvent coder les guards sans arbitrage restant
