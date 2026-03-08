# Catalogue REST P1 - MVP publication & inscription

## Objet

Documenter les endpoints REST minimums a stabiliser en `Sprint 0` pour
ouvrir `Sprint 1` sans ambiguite de routing, d'ACL ni de payloads.

## Conventions transverses

### Prefixes Gateway

- `Identity & Access` -> `/api/auth/*`
- `Event Management` -> `/api/events/*`
- `Catalog & Search` -> `/api/catalog/*`
- facade participant `P1` -> `/api/profile/*`
- `Registration` -> `/api/registrations/*`

### Headers

- `Authorization: Bearer <accessToken>` sur toutes les routes protegees.
- `X-Correlation-ID` peut etre fourni par le client; la Gateway le
  genere sinon.
- Headers propages aux services apres validation auth:
  - `x-user-id`
  - `x-user-role`
  - `x-session-id`
  - `x-correlation-id`

### Format de reponse

Succes:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Erreur:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": []
}
```

### Codes d'erreur minimums

- `400` payload invalide ou incomplet
- `401` non authentifie ou token invalide
- `403` role ou ownership insuffisant
- `404` ressource introuvable ou non visible
- `409` conflit metier ou doublon
- `422` regle metier valide syntaxiquement mais refusant l'action

## Vue d'ensemble des endpoints

| Methode | Route Gateway | Service owner | Auth | Acteur principal | Usage |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `identity-access-service` | non | public | creer un compte |
| `POST` | `/api/auth/login` | `identity-access-service` | non | public | ouvrir une session |
| `POST` | `/api/auth/refresh` | `identity-access-service` | non | public | renouveler les tokens |
| `POST` | `/api/auth/forgot-password` | `identity-access-service` | non | public | demander un reset |
| `POST` | `/api/auth/reset-password` | `identity-access-service` | non | public | confirmer le reset |
| `GET` | `/api/catalog/events` | `catalog-search-service` | non | public | lister les evenements publies |
| `GET` | `/api/catalog/events/{eventId}` | `catalog-search-service` | non | public | voir le detail public |
| `POST` | `/api/events/drafts` | `event-management-service` | oui | organizer | creer un brouillon |
| `GET` | `/api/events/drafts` | `event-management-service` | oui | organizer | lister les brouillons |
| `GET` | `/api/events/drafts/{eventId}` | `event-management-service` | oui | organizer | lire un brouillon |
| `PATCH` | `/api/events/drafts/{eventId}` | `event-management-service` | oui | organizer | modifier un brouillon |
| `DELETE` | `/api/events/drafts/{eventId}` | `event-management-service` | oui | organizer | supprimer un brouillon |
| `POST` | `/api/events/drafts/{eventId}/publish` | `event-management-service` | oui | organizer | publier immediatement |
| `POST` | `/api/events/{eventId}/cancel` | `event-management-service` | oui | organizer | annuler un evenement |
| `GET` | `/api/events/me` | `event-management-service` | oui | organizer | vue "Mes evenements" |
| `POST` | `/api/registrations` | `registration-service` | oui | participant | creer une inscription |
| `POST` | `/api/registrations/{registrationId}/cancel` | `registration-service` | oui | participant | annuler une inscription |
| `GET` | `/api/profile/participations` | facade Gateway vers `registration-service` | oui | participant | lire l'historique participant |

## Identity & Access

| Methode | Route | Request | Succes | Erreurs principales | Notes |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | `email`, `password`, `displayName`, `role` | `201` + `userId`, `email`, `role`, `accountStatus`, `nextAction` | `400`, `409`, `422` | `role` limite a `PARTICIPANT` ou `ORGANIZER` en self-service |
| `POST` | `/api/auth/login` | `email`, `password` | `200` + `accessToken`, `refreshToken`, `expiresIn`, `sessionId`, `user` | `400`, `401` | compte `LOCKED` ou `DISABLED` refuse via `code` metier |
| `POST` | `/api/auth/refresh` | `refreshToken` | `200` + nouveaux tokens et `sessionId` | `400`, `401` | session revoquee ou expiree refusee |
| `POST` | `/api/auth/forgot-password` | `email` | `202` + message generique | `400` | pas d'exposition de l'existence du compte |
| `POST` | `/api/auth/reset-password` | `token`, `newPassword` | `200` + confirmation | `400`, `401`, `422` | token usage unique |

Exemple de succes `POST /api/auth/login`:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access",
    "refreshToken": "opaque-refresh",
    "expiresIn": 900,
    "sessionId": "9bc9f8c4-95c7-4b7d-9b23-2d8bb890e75f",
    "user": {
      "userId": "5f31b51d-8e31-46e0-b674-cb6c38446c0a",
      "displayName": "Mourad",
      "role": "ORGANIZER",
      "accountStatus": "ACTIVE"
    }
  }
}
```

## Catalog & Search

| Methode | Route | Request | Succes | Erreurs principales | Notes |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/api/catalog/events` | query `q`, `theme`, `city`, `from`, `to`, `page`, `pageSize` | `200` + liste paginee d'evenements publics | `400` | ne renvoie jamais les brouillons |
| `GET` | `/api/catalog/events/{eventId}` | path `eventId` | `200` + detail public | `404` | detail masque si non publie/non visible |

Exemple de `data` pour la liste catalogue:

```json
{
  "items": [
    {
      "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
      "title": "Forum Tech Casablanca",
      "theme": "Tech",
      "city": "Casablanca",
      "startAt": "2026-04-02T09:00:00Z",
      "status": "PUBLISHED"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

## Event Management

ACL minimale:

- routes `drafts` et `me` reservees a `ORGANIZER` ou `ADMIN`
- un organisateur ne peut manipuler que ses propres evenements

| Methode | Route | Request | Succes | Erreurs principales | Notes |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/events/drafts` | `title`, `description`, `theme`, `venueName`, `city`, `startAt`, `endAt?`, `timezone`, `capacity`, `visibility`, `pricingType` | `201` + brouillon cree | `400`, `401`, `403`, `422` | `status` force a `DRAFT` |
| `GET` | `/api/events/drafts` | query `page`, `pageSize` | `200` + brouillons du createur | `401`, `403` | listing strictement scope au proprietaire |
| `GET` | `/api/events/drafts/{eventId}` | path `eventId` | `200` + detail brouillon | `401`, `403`, `404` | ownership obligatoire |
| `PATCH` | `/api/events/drafts/{eventId}` | champs modifiables du brouillon | `200` + brouillon maj | `400`, `401`, `403`, `404`, `422` | interdit si deja publie |
| `DELETE` | `/api/events/drafts/{eventId}` | path `eventId` | `204` | `401`, `403`, `404`, `409` | seulement si `status = DRAFT` |
| `POST` | `/api/events/drafts/{eventId}/publish` | `publishMode`, `scheduledAt?` | `200` + `eventId`, `status`, `publishedAt` | `400`, `401`, `403`, `404`, `409`, `422` | `publishMode = IMMEDIATE` seul obligatoire en `P1` |
| `POST` | `/api/events/{eventId}/cancel` | `reasonCode?` | `200` + `eventId`, `status`, `cancelledAt` | `400`, `401`, `403`, `404`, `409` | reserve le hook d'annulation metier et `event.cancelled` |
| `GET` | `/api/events/me` | query `status`, `theme`, `fromDate`, `toDate`, `page`, `pageSize` | `200` + liste paginee + compteurs | `401`, `403` | base de la vue "Mes evenements" |

Exemple de succes `POST /api/events/drafts/{eventId}/publish`:

```json
{
  "success": true,
  "data": {
    "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
    "status": "PUBLISHED",
    "publishedAt": "2026-03-23T10:15:00Z"
  }
}
```

## Registration et facade profile `P1`

ACL minimale:

- `POST /api/registrations` reserve a `PARTICIPANT`
- `POST /api/registrations/{registrationId}/cancel` reserve au
  participant proprietaire ou a un workflow systeme derive
- `GET /api/profile/participations` reserve au participant connecte

| Methode | Route | Request | Succes | Erreurs principales | Notes |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/api/registrations` | `eventId`; header `Idempotency-Key` recommande | `201` + `registrationId`, `status`, `waitlistPosition?` | `400`, `401`, `403`, `404`, `409`, `422` | statut retourne `CONFIRMED` ou `WAITLISTED` |
| `POST` | `/api/registrations/{registrationId}/cancel` | path `registrationId` | `200` + statut `CANCELLED`, `promotedRegistrationId?` | `401`, `403`, `404`, `409`, `422` | conserve l'historique |
| `GET` | `/api/profile/participations` | query `status?`, `page`, `pageSize` | `200` + historique participant | `401`, `403` | facade profile, owner `registration-service` en `P1` |

Exemple de succes `POST /api/registrations`:

```json
{
  "success": true,
  "data": {
    "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
    "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
    "status": "WAITLISTED",
    "waitlistPosition": 1
  }
}
```

## Regles transverses par flux

### Auth et session

- `register` ne doit jamais creer un compte en doublon sur le meme
  `email`.
- `refresh` renouvelle la session sans changer `userId` ni `role`.
- les reponses `401` et `403` doivent rester homogenes entre Gateway et
  services.

### Event Management

- toutes les validations de dates/capacite vivent cote service, pas
  uniquement dans l'UI;
- `publish` refuse un brouillon incomplet ou non proprietaire;
- la publication reussie doit emettre `event.published`;
- l'annulation reussie doit emettre `event.cancelled`.

### Registration

- une seule inscription active par couple `participant + evenement`;
- la derniere place et la promotion de waitlist doivent etre traitees de
  facon atomique;
- l'annulation reussie doit pouvoir declencher `registration.promoted`.

## Surface interne d'operabilite

Chaque service `P1` expose en interne:

- `GET /health`
- `GET /ready`

Format minimum:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "registration-service"
  }
}
```

## Arbitrages explicitement retenus

- Le detail et l'historique participant restent exposes en facade
  `/api/profile/*`, meme si la source `P1` demeure `registration-service`.
- `Catalog & Search` est strictement un read model public derive de
  `Event Management`.
- Les routes d'action metier irreversibles utilisent des sous-ressources
  explicites (`/publish`, `/cancel`) plutot qu'une suppression physique.
