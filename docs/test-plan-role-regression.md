# Plan de non-regression ACL et roles

## Objet

Documenter les scenarios minimums `401/403/200` a rejouer a chaque
evolution des routes critiques `P1`, afin d'eviter les regressions de
role, d'ownership et de facade Gateway.

## Perimetre

- routes publiques auth et catalogue
- routes organisateur `event-management-service`
- routes participant `registration-service` et facade `profile`
- comportement ownership `own-resource`
- propagation du contexte auth par la Gateway

## Acteurs de test recommandes

- `anonymous`: aucun token
- `participant-1`: role `PARTICIPANT`
- `participant-2`: second participant pour tester l'ownership
- `organizer-1`: proprietaire de l'evenement cible
- `organizer-2`: organisateur non proprietaire
- `admin-1`: role `ADMIN`

## Regles transverses

- absence de token sur route protegee -> `401`
- role incorrect mais token valide -> `403`
- ownership invalide sur ressource protegee -> `403` ou `404` selon le
  contrat documente
- les headers `x-user-id`, `x-user-role`, `x-session-id`,
  `x-correlation-id` doivent etre propages de facon stable apres
  validation auth

## Matrice de regression

### Routes publiques et auth

| ID | Route | anonymous | participant | organizer | admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `ACL-01` | `POST /api/auth/register` | `201/409/422` | `201/409/422` | `201/409/422` | `201/409/422` | route publique, pas de role requis |
| `ACL-02` | `POST /api/auth/login` | `200/401` | `200/401` | `200/401` | `200/401` | route publique |
| `ACL-03` | `POST /api/auth/refresh` | `200/401` | `200/401` | `200/401` | `200/401` | route publique sur refresh token |
| `ACL-04` | `GET /api/catalog/events` | `200` | `200` | `200` | `200` | lecture publique |
| `ACL-05` | `GET /api/catalog/events/{eventId}` public | `200` | `200` | `200` | `200` | detail public visible |
| `ACL-06` | `GET /api/catalog/events/{eventId}` non public | `404` | `404` | `404` | `404` | pas de fuite de visibilite |

### Routes organisateur et admin

| ID | Route | anonymous | participant-1 | organizer-1 | organizer-2 | admin-1 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ACL-10` | `POST /api/events/drafts` | `401` | `403` | `201` | `201` | `201` | reserve `ORGANIZER`, `ADMIN` |
| `ACL-11` | `GET /api/events/drafts` | `401` | `403` | `200` | `200` | `200` | chaque organisateur ne voit que ses brouillons |
| `ACL-12` | `GET /api/events/drafts/{eventId}` owner | `401` | `403` | `200` | `403/404` | `200` | ownership strict |
| `ACL-13` | `PATCH /api/events/drafts/{eventId}` owner | `401` | `403` | `200` | `403/404` | `200` | update reserve au owner ou admin |
| `ACL-14` | `DELETE /api/events/drafts/{eventId}` owner | `401` | `403` | `204` | `403/404` | `204` | seulement si `DRAFT` |
| `ACL-15` | `POST /api/events/drafts/{eventId}/publish` owner | `401` | `403` | `200` | `403/404` | `200` | publication reservee owner/admin |
| `ACL-16` | `POST /api/events/{eventId}/cancel` owner | `401` | `403` | `200` | `403/404` | `200` | annulation metier owner/admin |
| `ACL-17` | `GET /api/events/me` | `401` | `403` | `200` | `200` | `200` | listing scope au caller |

### Routes participant et facade profile

| ID | Route | anonymous | participant-1 owner | participant-2 non-owner | organizer-1 | admin-1 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ACL-20` | `POST /api/registrations` | `401` | `201/409/422` | `201/409/422` | `403` | `403` | reserve `PARTICIPANT` |
| `ACL-21` | `POST /api/registrations/{registrationId}/cancel` own registration | `401` | `200/409/422` | `403/404` | `403` | `403` | owner participant uniquement en `P1` |
| `ACL-22` | `GET /api/profile/participations` | `401` | `200` | `200` | `403` | `403` | chaque participant ne voit que ses inscriptions |

## Scenarios de non-regression prioritaires

### `NR-01` - Token absent ou invalide

- rejouer au moins une route protegee par domaine:
  - `POST /api/events/drafts`
  - `POST /api/registrations`
  - `GET /api/profile/participations`

Checks:

- absence de token -> `401`
- token expire ou invalide -> `401`
- aucun header `x-user-*` n'est consomme cote service si auth echoue

### `NR-02` - Role incorrect

- appeler une route organisateur avec un participant
- appeler une route participant avec un organisateur

Checks:

- reponse `403`
- message et `code` restent homogenes entre services

### `NR-03` - Ownership evenement

- `organizer-2` tente de lire, modifier, publier ou annuler un event de
  `organizer-1`

Checks:

- `403` ou `404` selon le contrat retenu
- aucune modification observable sur la ressource cible

### `NR-04` - Ownership inscription

- `participant-2` tente d'annuler ou de lire une inscription de
  `participant-1`

Checks:

- `POST /api/registrations/{registrationId}/cancel` retourne `403` ou
  `404`
- `GET /api/profile/participations` ne retourne jamais l'inscription
  d'un autre participant

### `NR-05` - Admin reserve

- `admin-1` ne doit pas obtenir par erreur un acces implicite a une
  route participant `P1`

Checks:

- `POST /api/registrations` -> `403`
- `GET /api/profile/participations` -> `403`
- les futures extensions admin devront etre documentees avant ouverture
  d'un bypass volontaire

### `NR-06` - Propagation du contexte auth

- utiliser un `X-Correlation-ID` fixe et un utilisateur connu

Checks:

- la Gateway propage `x-user-id`, `x-user-role`, `x-session-id`,
  `x-correlation-id`
- les logs metier reprennent ces valeurs sur les routes critiques

## Sortie attendue

- une grille ACL rejouable a chaque increment `P1`
- une base simple pour les tests automatiques d'autorisation
- une reduction du risque de regressions cross-service pendant
  `Sprint 1`
