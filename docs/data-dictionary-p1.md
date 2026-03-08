# Dictionnaire de donnees P1 - MVP publication & inscription

## Objet

Fixer les entites minimales du lot `P1` avant implementation afin que
les contrats REST, les events async et les vues frontend reposent sur le
meme vocabulaire.

## Conventions communes

- Identifiants techniques: `UUID` opaque, expose sous forme de chaine.
- Dates: `ISO 8601` en UTC.
- Statuts metier: enums majuscules.
- Champs sensibles: jamais exposes sans justification explicite.
- Source de verite: un seul service proprietaire par entite.

## Vue d'ensemble

| Entite | Service proprietaire | Usage principal en `P1` |
| --- | --- | --- |
| `User` | `identity-access-service` | authentification, roles, ownership |
| `Session` | `identity-access-service` | refresh, invalidation, tracabilite session |
| `PasswordResetToken` | `identity-access-service` | reset mot de passe |
| `Event` | `event-management-service` | brouillon, publication, listing organisateur |
| `CatalogEventView` | `catalog-search-service` | liste/detail publics derives |
| `Registration` | `registration-service` | capacite, waitlist, annulation, promotion |
| `EventRegistrationSnapshot` | `event-management-service` -> copie locale `registration-service` | policy evenement locale pour capacity lock et historique |
| `ParticipationView` | `registration-service` en facade `profile` `P1` | historique participant |

## Identity & Access

### `User`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `userId` | `UUID` | oui | identifiant principal |
| `email` | `string` | oui | unique, sensible |
| `passwordHash` | `string` | oui | jamais expose |
| `displayName` | `string` | oui | nom visible UI |
| `role` | `PARTICIPANT \| ORGANIZER \| ADMIN` | oui | role principal MVP |
| `accountStatus` | `PENDING \| ACTIVE \| DISABLED \| LOCKED` | oui | etat du compte |
| `createdAt` | `datetime` | oui | audit minimal |
| `updatedAt` | `datetime` | oui | audit minimal |
| `lastLoginAt` | `datetime` | non | utile pour securite/audit |

### `Session`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `sessionId` | `UUID` | oui | identifiant de session |
| `userId` | `UUID` | oui | reference `User` |
| `refreshTokenHash` | `string` | oui | jamais expose |
| `expiresAt` | `datetime` | oui | fin de validite refresh |
| `revokedAt` | `datetime` | non | null si active |
| `createdAt` | `datetime` | oui | audit/session policy |
| `clientType` | `WEB \| UNKNOWN` | non | telemetrie MVP suffisante |

### `PasswordResetToken`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `resetTokenId` | `UUID` | oui | identifiant interne |
| `userId` | `UUID` | oui | reference `User` |
| `tokenHash` | `string` | oui | jamais expose |
| `expiresAt` | `datetime` | oui | fenetre de validite |
| `consumedAt` | `datetime` | non | null tant que non utilise |
| `createdAt` | `datetime` | oui | audit minimal |

## Event Management

### `Event`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `eventId` | `UUID` | oui | identifiant principal |
| `organizerId` | `UUID` | oui | reference au `User` proprietaire |
| `title` | `string` | oui | visible UI public/back-office |
| `description` | `string` | oui | contenu principal |
| `theme` | `string` | oui | filtre catalogue MVP |
| `venueName` | `string` | oui | lieu principal |
| `city` | `string` | oui | filtre catalogue MVP |
| `startAt` | `datetime` | oui | date/heure debut |
| `endAt` | `datetime` | non | optionnel au MVP |
| `timezone` | `string` | oui | affichage coherent |
| `capacity` | `integer` | oui | > 0 |
| `visibility` | `PUBLIC \| PRIVATE` | oui | `PUBLIC` attendue en MVP |
| `pricingType` | `FREE \| PAID` | oui | `PAID` hors flux `P1` mais champ reserve |
| `status` | `DRAFT \| PUBLISHED \| FULL \| CLOSED \| ARCHIVED \| CANCELLED` | oui | machine d'etat owner `Event` |
| `coverImageRef` | `string` | non | reserve media |
| `publishedAt` | `datetime` | non | null tant que non publie |
| `createdAt` | `datetime` | oui | audit minimal |
| `updatedAt` | `datetime` | oui | audit minimal |

## Catalog & Search

### `CatalogEventView`

Projection derivee construite a partir de `Event`. Elle ne possede pas
la regle metier d'edition.

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `eventId` | `UUID` | oui | reference `Event` |
| `title` | `string` | oui | libelle public |
| `theme` | `string` | oui | filtre MVP |
| `venueName` | `string` | oui | lieu visible |
| `city` | `string` | oui | filtre MVP |
| `startAt` | `datetime` | oui | tri/calendrier |
| `visibility` | `PUBLIC` | oui | seules les donnees publiques sont exposees |
| `status` | `PUBLISHED \| FULL \| CLOSED \| CANCELLED` | oui | statut de lecture publique |
| `excerpt` | `string` | non | resume court |
| `coverImageUrl` | `string` | non | URL derivee media |
| `publishedAt` | `datetime` | oui | tri recence/publication |
| `lastSyncedAt` | `datetime` | oui | observabilite projection |

## Registration

### `Registration`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `registrationId` | `UUID` | oui | identifiant principal |
| `eventId` | `UUID` | oui | reference `Event` |
| `participantId` | `UUID` | oui | reference `User` |
| `status` | `CONFIRMED \| WAITLISTED \| CANCELLED \| REJECTED` | oui | machine d'etat owner `Registration` |
| `waitlistPosition` | `integer` | non | null hors waitlist |
| `source` | `DIRECT \| WAITLIST_PROMOTION` | oui | origine de confirmation |
| `cancelReason` | `PARTICIPANT \| ORGANIZER \| EVENT_CANCELLED` | non | renseigne a l'annulation |
| `createdAt` | `datetime` | oui | date de demande |
| `updatedAt` | `datetime` | oui | derniere transition |
| `cancelledAt` | `datetime` | non | null si active |
| `promotedAt` | `datetime` | non | null si jamais promue |

Regles minimales:

- une seule inscription active par couple `participantId + eventId`;
- `waitlistPosition` obligatoire quand `status = WAITLISTED`;
- `promotedAt` ne peut exister que si la demande etait initialement
  `WAITLISTED`;
- la transition vers `CANCELLED` conserve l'historique.

### `EventRegistrationSnapshot`

Projection locale minimale de la policy evenement necessaire au service
Registration.

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `eventId` | `UUID` | oui | cle de projection locale |
| `organizerId` | `UUID` | oui | contexte de lecture |
| `title` | `string` | oui | enrichissement historique |
| `city` | `string` | non | enrichissement historique |
| `startAt` | `datetime` | oui | affichage participant |
| `capacity` | `integer` | oui | copie de capacity declaree |
| `visibility` | `PUBLIC \| PRIVATE` | oui | policy d'acces |
| `eventStatus` | `PUBLISHED \| FULL \| CLOSED \| CANCELLED` | oui | copie derivee du statut utile a Registration |
| `acceptingRegistrations` | `boolean` | oui | resume metier calcule par Event Management |
| `lastSyncedAt` | `datetime` | oui | observabilite et coherence de projection |

Source de verite:

- `event-management-service` pour le contenu metier
- `registration-service` pour la copie locale et son verrouillage
  transactionnel

### `ParticipationView`

Projection de lecture pour l'espace participant. En `P1`, elle peut etre
servie par `registration-service` derriere une facade Gateway
`/api/profile/participations` tant que `user-profile-service` n'est pas
isole.

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `registrationId` | `UUID` | oui | reference `Registration` |
| `eventId` | `UUID` | oui | reference `Event` |
| `eventTitle` | `string` | oui | libelle UI |
| `eventStartAt` | `datetime` | oui | affichage dashboard |
| `eventCity` | `string` | non | contexte visuel |
| `registrationStatus` | `CONFIRMED \| WAITLISTED \| CANCELLED \| REJECTED` | oui | statut lisible participant |
| `waitlistPosition` | `integer` | non | utile si en attente |
| `canDownloadTicket` | `boolean` | oui | `false` en `P1` |
| `updatedAt` | `datetime` | oui | tri historique |

## Enums metier a partager

### Roles

- `PARTICIPANT`
- `ORGANIZER`
- `ADMIN`

### Statuts compte

- `PENDING`
- `ACTIVE`
- `DISABLED`
- `LOCKED`

### Statuts evenement

- `DRAFT`
- `PUBLISHED`
- `FULL`
- `CLOSED`
- `ARCHIVED`
- `CANCELLED`

### Statuts inscription

- `CONFIRMED`
- `WAITLISTED`
- `CANCELLED`
- `REJECTED`

## Points a surveiller

- `CatalogEventView` ne doit jamais exposer de donnees internes
  organisateur.
- `ParticipationView` est une projection de lecture, pas une nouvelle
  source de verite.
- Les statuts visibles en frontend doivent reprendre exactement les enums
  documentees ici.
