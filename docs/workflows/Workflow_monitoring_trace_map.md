# Workflow monitoring - Distributed trace map (`M04.1`)

Ce document liste les points de trace critiques du projet Evenements
et leurs spans attendus sur les deux flux prioritaires: publication
d'evenement et inscription participant (ticket `M04.1`).

Dependances:

- `M02.1` standard de logs / correlation-id
- `M02.2` propagation correlation-id Gateway → services

## 1. Objectif

Definir les etapes instrumentees de chaque flux de sorte que:

- Un incident puisse etre retrace du premier appel jusqu'au dernier
  service concerne via un `correlationId` unique.
- Les spans attendus soient connus avant implementation du tracing
  distribue (`M04.2`).
- Les equipes sachent ou placer les marques de debut / fin de span
  sans ambiguite.

## 2. Convention de nommage des spans

```
<service>.<domaine>.<action>
```

Exemples: `gateway.auth.verify`, `event-management.draft.publish`,
`registration.seat.reserve`.

Chaque span porte:

| Attribut | Description |
| --- | --- |
| `correlationId` | Identifiant de trace partage (header `x-correlation-id`) |
| `spanId` | Identifiant unique du span (UUID genere localement) |
| `parentSpanId` | `spanId` du span parent (null pour le span racine) |
| `service` | Nom du service emetteur |
| `operation` | Nom du span (`<service>.<domaine>.<action>`) |
| `startAt` | ISO-8601 debut |
| `endAt` | ISO-8601 fin |
| `status` | `ok` ou `error` |
| `errorCode` | Code d'erreur si `status = error` (optionnel) |

## 3. Flux 1 — Publication d'evenement

### 3.1 Chemin nominal

```
Client (organisateur)
  POST /api/events/drafts/:eventId/publish
  │
  ▼
[1] gateway.auth.verify
    Verification JWT, extraction userId/role
  │
  ▼
[2] gateway.proxy.forward  →  event-management-service
  │
  ▼
[3] event-management.event.find_by_id
    Chargement de l'evenement depuis Postgres
  │
  ▼
[4] event-management.event.publish
    UPDATE events SET status='PUBLISHED'
  │
  ▼
[5] event-management.notification.emit
    POST /notifications/emit vers registration-service
  │
  ▼
[6] registration.notification.persist   (async)
    Ecriture de la notification dans les logs
```

### 3.2 Spans attendus

| # | Span | Service | Dependance DB/IO |
| --- | --- | --- | --- |
| 1 | `gateway.auth.verify` | api-gateway | JWT verify (CPU) |
| 2 | `gateway.proxy.forward` | api-gateway | HTTP → event-management |
| 3 | `event-management.event.find_by_id` | event-management-service | Postgres SELECT |
| 4 | `event-management.event.publish` | event-management-service | Postgres UPDATE |
| 5 | `event-management.notification.emit` | event-management-service | HTTP → registration-service |
| 6 | `registration.notification.persist` | registration-service | Postgres INSERT |

### 3.3 Cas d'erreur a tracer

| Erreur | Span concerne | `errorCode` |
| --- | --- | --- |
| JWT invalide | `gateway.auth.verify` | `INVALID_TOKEN` |
| Evenement introuvable | `event-management.event.find_by_id` | `EVENT_NOT_FOUND` |
| Statut source invalide | `event-management.event.publish` | `EVENT_NOT_PUBLISHABLE` |
| Timeout notification | `event-management.notification.emit` | `NOTIFICATION_TIMEOUT` |

## 4. Flux 2 — Inscription participant

### 4.1 Chemin nominal

```
Client (participant)
  POST /api/registrations
  │
  ▼
[1] gateway.auth.verify
    Verification JWT, role=PARTICIPANT
  │
  ▼
[2] gateway.proxy.forward  →  registration-service
  │
  ▼
[3] registration.event.load
    GET /events/:eventId vers event-management-service
  │
  ▼
[4] registration.seat.check
    Verification capacite (count CONFIRMED)
  │
  ▼
[5] registration.duplicate.check
    Verification unicite participant/evenement
  │
  ▼
[6] registration.registration.create
    INSERT INTO registrations (CONFIRMED ou WAITLISTED)
  │
  ▼
[7] registration.ticket.generate      (si CONFIRMED)
    Generation billet + QR code
  │
  ▼
[8] registration.notification.emit
    POST /notifications/emit (confirmation ou attente)
```

### 4.2 Spans attendus

| # | Span | Service | Dependance DB/IO |
| --- | --- | --- | --- |
| 1 | `gateway.auth.verify` | api-gateway | JWT verify |
| 2 | `gateway.proxy.forward` | api-gateway | HTTP → registration-service |
| 3 | `registration.event.load` | registration-service | HTTP → event-management |
| 4 | `registration.seat.check` | registration-service | Postgres SELECT COUNT |
| 5 | `registration.duplicate.check` | registration-service | Postgres SELECT |
| 6 | `registration.registration.create` | registration-service | Postgres INSERT |
| 7 | `registration.ticket.generate` | registration-service | CPU + Postgres INSERT |
| 8 | `registration.notification.emit` | registration-service | HTTP → notification |

### 4.3 Cas d'erreur a tracer

| Erreur | Span concerne | `errorCode` |
| --- | --- | --- |
| JWT invalide | `gateway.auth.verify` | `INVALID_TOKEN` |
| Evenement complet (→ waitlist) | `registration.seat.check` | — (chemin nominal alternatif) |
| Doublon actif | `registration.duplicate.check` | `REGISTRATION_EXISTS` |
| Erreur DB inscription | `registration.registration.create` | `DB_WRITE_FAILED` |
| Timeout ticket | `registration.ticket.generate` | `TICKET_GENERATION_TIMEOUT` |

## 5. Propagation du correlationId

Le `correlationId` est propague via le header HTTP `x-correlation-id`:

```
Client → Gateway (genere ou preserve) → Service A → Service B
         ^
         createCorrelationIdMiddleware() dans shared/observability.js
```

Regles:

1. La Gateway genere un `correlationId` si absent du client.
2. Chaque service preserve le `correlationId` entrant et le passe
   aux appels inter-services sortants.
3. Tous les spans d'une meme requete partagent le meme `correlationId`.
4. Le `correlationId` est retourne dans le header de reponse
   `x-correlation-id` a chaque niveau.

## 6. Granularite MVP vs futur

| Granularite | MVP (M04.2) | Sprint 6+ |
| --- | --- | --- |
| Propagation correlation-id | Oui (deja en place) | — |
| Logs JSON structures par span | Oui | — |
| Trace viewer (Jaeger/Zipkin) | Non | Oui |
| Auto-instrumentation OpenTelemetry | Non | Oui |
| Sampling configurable | Non | Oui |

En MVP, les traces sont reconstituables depuis les logs JSON
en filtrant par `correlationId`.  Un incident peut etre retrace
sans outillage de trace viewer dedie.

## 7. Implementation attendue (M04.2)

Pour chaque span liste ci-dessus:

1. Ajouter un log `info` au debut du span avec `{ correlationId, spanId, operation, startAt }`.
2. Ajouter un log `info` ou `error` a la fin avec `{ correlationId, spanId, operation, endAt, status, errorCode? }`.
3. Passer `correlationId` dans tous les headers des appels HTTP sortants.

Les fonctions `createJsonLogger` et `createCorrelationIdMiddleware`
de `services/shared/observability.js` sont le point d'entree.
