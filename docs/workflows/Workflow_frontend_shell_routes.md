# Workflow frontend - shell routes Sprint 0

Document de stabilisation des routes frontend pour le cadrage `Sprint 0`
(`S0-I01`) sur les shells MVP:

- portail public
- espace participant
- back-office organisateur

Ce document couvre les tickets:

- `F01.1` routes portail public
- `F02.1` routes espace participant
- `F03.1` routes back-office organisateur

## 1. Portail public

| Route | Acces | Ecran | Contrat backend principal |
| --- | --- | --- | --- |
| `/` | public | Home | `GET /api/catalog/events` (extrait) |
| `/events` | public | Catalogue (grille/calendrier) | `GET /api/catalog/events` |
| `/events/:eventId` | public | Detail evenement | `GET /api/catalog/events/{eventId}` |

Regles UI:

- aucune auth requise
- etats minimums: `loading`, `empty`, `error`
- CTA vers inscription depuis le detail (`/auth/login` si non connecte)

## 2. Espace participant

| Route | Acces | Ecran | Contrat backend principal |
| --- | --- | --- | --- |
| `/auth/login` | public | Connexion | `POST /api/auth/login` |
| `/auth/register` | public | Inscription | `POST /api/auth/register` |
| `/participant/dashboard` | `PARTICIPANT` | Vue d'accueil participant | `GET /api/profile/participations` (resume) |
| `/participant/participations` | `PARTICIPANT` | Historique participations | `GET /api/profile/participations` |

Regles UI:

- session invalide/expiree: redirection vers `/auth/login`
- role non conforme: ecran `403` (pas de fallback silencieux)
- vocabulaire de statut aligne: `CONFIRMED`, `WAITLISTED`, `CANCELLED`

## 3. Back-office organisateur

| Route | Acces | Ecran | Contrat backend principal |
| --- | --- | --- | --- |
| `/organizer/events` | `ORGANIZER` ou `ADMIN` | Mes evenements (liste) | `GET /api/events/me` |
| `/organizer/events/new` | `ORGANIZER` ou `ADMIN` | Creation evenement | `POST /api/events/drafts` |
| `/organizer/events/:eventId/edit` | `ORGANIZER` ou `ADMIN` | Edition brouillon | `GET/PATCH /api/events/drafts/{eventId}` |
| `/organizer/events/:eventId/registrations` | `ORGANIZER` ou `ADMIN` | Vue inscrits | `GET /api/registrations` (scope event, futur `Sprint 1+`) |

Regles UI:

- publication: action depuis edition via
  `POST /api/events/drafts/{eventId}/publish`
- suppression brouillon: `DELETE /api/events/drafts/{eventId}`
- filtrage "Mes evenements" strictement scope a l'organisateur courant

## 4. Layout et navigation cible

- `PublicLayout`: header public, recherche, footer
- `ParticipantLayout`: navigation participant + etat session
- `OrganizerLayout`: navigation metier organisateur, actions rapides

Navigation primaire:

- public -> participant: via login/register
- participant -> public: via catalogue/detail
- organisateur -> back-office: entree dediee, route guardee

## 5. Etats transverses obligatoires

Sur toutes les routes ci-dessus:

- `loading`: skeleton/spinner
- `empty`: message explicite + action suivante
- `error`: message + retry
- `forbidden`: ecran `403`
- `unauthenticated`: redirection login + retour vers route initiale

## 6. Hors scope de ce lot

- shell admin detaille (traite via `A01.1`)
- implementation UI reactive complete (`Sprint 1`)
- gestion avancee responsive/a11y (`F07.x`)

## 7. References

- `docs/workflows/Workflow_frontend.md`
- `docs/api-contracts-p1.md`
- `docs/sprints/sprint_0_architecture_foundation.md`
