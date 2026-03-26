# Catalogue d'evenements async P1

## Objet

Stabiliser les evenements metier asynchrones necessaires au decoupage
`P1`, ainsi que les hooks reserves pour `P2` et `P3`.

## Principes

- sauf exception cross-cutting explicitement documentee, un event a un
  seul producteur proprietaire;
- les consommateurs doivent etre rejouables et idempotents;
- les traitements derives preferent l'async plutot que les appels
  synchrones en chaine;
- le payload transporte uniquement ce qui est necessaire au cas d'usage
  derive.

## Enveloppe standard

```json
{
  "messageId": "c8eb99e6-30d8-4a0f-8d2a-123456789abc",
  "eventName": "registration.confirmed",
  "version": 1,
  "occurredAt": "2026-03-23T10:15:00Z",
  "producer": "registration-service",
  "correlationId": "req-123",
  "data": {}
}
```

Champs obligatoires:

- `messageId`: identifiant unique du message
- `eventName`: nom canonique
- `version`: version de schema
- `occurredAt`: horodatage d'emission
- `producer`: service source
- `correlationId`: lien avec logs et flux sync
- `data`: payload metier

## Vue d'ensemble

| Event | Producteur | Consommateurs cibles | Phase | Statut |
| --- | --- | --- | --- | --- |
| `event.published` | `event-management-service` | `catalog-search-service`, futurs `notification/admin` | `P1` | requis |
| `event.cancelled` | `event-management-service` | `catalog-search-service`, `registration-service`, futurs `notification/admin` | `P1` | requis |
| `registration.confirmed` | `registration-service` | futurs `ticketing`, `notification`, `admin` | `P1` | requis |
| `registration.waitlisted` | `registration-service` | futurs `notification`, `admin` | `P1` | requis |
| `registration.promoted` | `registration-service` | futurs `ticketing`, `notification`, `admin` | `P1` | requis |
| `notification.email.requested` | service source documente | `notification-service` | `P2` | reserve |
| `ticket.generated` | `ticketing-service` | `registration-service`, `notification-service` | `P2` | reserve |
| `audit.action.recorded` | service source | `admin/audit-store` | `P3` | reserve |

## Events requis pour `P1`

### `event.published`

- Producteur: `event-management-service`
- Emis quand: un brouillon valide passe a `PUBLISHED`
- Consommateurs cibles:
  - `catalog-search-service`
  - plus tard `notification-service`
  - plus tard `admin-service`

Payload minimal:

```json
{
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "organizerId": "5f31b51d-8e31-46e0-b674-cb6c38446c0a",
  "status": "PUBLISHED",
  "visibility": "PUBLIC",
  "title": "Forum Tech Casablanca",
  "theme": "Tech",
  "city": "Casablanca",
  "venueName": "Anfa Park",
  "startAt": "2026-04-02T09:00:00Z",
  "publishedAt": "2026-03-23T10:15:00Z"
}
```

Comportement retry/idempotence:

- `catalog-search-service` doit upserter la projection par `eventId`;
- un replay ne doit pas dupliquer l'evenement public.

### `event.cancelled`

- Producteur: `event-management-service`
- Emis quand: un evenement publie ou visible passe a `CANCELLED`
- Consommateurs cibles:
  - `catalog-search-service`
  - `registration-service`
  - plus tard `notification-service`
  - plus tard `admin-service`

Payload minimal:

```json
{
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "organizerId": "5f31b51d-8e31-46e0-b674-cb6c38446c0a",
  "previousStatus": "PUBLISHED",
  "status": "CANCELLED",
  "cancelledAt": "2026-03-29T12:00:00Z",
  "reasonCode": "ORGANIZER_CANCELLED"
}
```

Comportement retry/idempotence:

- `catalog-search-service` marque ou retire la vue publique sans
  suppression aveugle;
- `registration-service` doit refuser toute nouvelle inscription sur
  cet evenement apres consommation effective.

### `registration.confirmed`

- Producteur: `registration-service`
- Emis quand: une inscription reserve effectivement une place
- Consommateurs cibles:
  - futur `ticketing-service`
  - futur `notification-service`
  - futur `admin-service`

Payload minimal:

```json
{
  "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "participantId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "status": "CONFIRMED",
  "source": "DIRECT",
  "confirmedAt": "2026-03-23T11:05:00Z"
}
```

Comportement retry/idempotence:

- `ticketing-service` devra dedupliquer par `registrationId`;
- `notification-service` devra dedupliquer par `messageId`.

### `registration.waitlisted`

- Producteur: `registration-service`
- Emis quand: aucune place n'est disponible mais la demande reste
  recevable
- Consommateurs cibles:
  - futur `notification-service`
  - futur `admin-service`

Payload minimal:

```json
{
  "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "participantId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "status": "WAITLISTED",
  "waitlistPosition": 1,
  "createdAt": "2026-03-23T11:05:00Z"
}
```

Comportement retry/idempotence:

- les consumers ne doivent jamais incrementer une position eux-memes;
- la position reste informative, sa source de verite demeure
  `registration-service`.

### `registration.promoted`

- Producteur: `registration-service`
- Emis quand: une demande `WAITLISTED` passe a `CONFIRMED`
- Consommateurs cibles:
  - futur `ticketing-service`
  - futur `notification-service`
  - futur `admin-service`

Payload minimal:

```json
{
  "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "participantId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "previousStatus": "WAITLISTED",
  "status": "CONFIRMED",
  "source": "WAITLIST_PROMOTION",
  "promotedAt": "2026-03-24T08:10:00Z"
}
```

Comportement retry/idempotence:

- l'algorithme de promotion reste strictement owner `registration-service`;
- un replay ne doit pas generer plusieurs billets ni plusieurs emails.

## Hooks reserves des `P2/P3`

### `notification.email.requested`

Usage futur:

- demander l'envoi d'un email transactionnel sans bloquer le flux sync
- templates typiques: confirmation, waitlist, promotion, annulation

Note de gouvernance:

- cette commande d'integration est une exception cross-cutting
  documentee; son emetteur doit rester explicite dans le contrat du flux
  source.

Payload minimal reserve:

```json
{
  "templateKey": "registration.confirmed",
  "recipientUserId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "context": {
    "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
    "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e"
  }
}
```

### `ticket.generated`

Usage futur:

- signaler qu'un billet a ete genere apres confirmation effective

Payload minimal reserve:

```json
{
  "ticketId": "22a4d1ce-6d18-48aa-920d-7a6de6a55f52",
  "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "artifactUrl": "https://media/tickets/22a4d1ce.pdf"
}
```

### `audit.action.recorded`

Usage futur:

- consolider les actions sensibles dans la console admin/audit

Payload minimal reserve:

```json
{
  "actorId": "5f31b51d-8e31-46e0-b674-cb6c38446c0a",
  "actorRole": "ORGANIZER",
  "action": "EVENT_PUBLISHED",
  "targetType": "EVENT",
  "targetId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "result": "SUCCESS"
}
```

## Regles de versionning et replay

- toute rupture de payload implique un changement de `version`;
- les consumers doivent ignorer les champs inconnus;
- le dedoublonnage minimal repose sur `messageId`;
- les projections derivees doivent etre upsertables;
- un event ne doit pas supposer qu'un seul consommateur existe.

## Observabilite minimale

- chaque emission doit journaliser `eventName`, `messageId`,
  `correlationId`, `producer` et le resultat d'envoi;
- chaque consumer doit journaliser reception, dedoublonnage, succes ou
  echec de traitement;
- les events critiques `event.published`, `registration.confirmed` et
  `registration.promoted` doivent etre retrouvables via
  `correlationId`.
---
title: Catalogue d'evenements async P1
description: Producteurs, consommateurs et payloads minimaux des evenements metier critiques.
docKind: catalog
domain: async-events
phase: P1
owner: Mourad
status: DONE
tags:
  - events
  - async
  - bus
slug: async-events-p1
---
