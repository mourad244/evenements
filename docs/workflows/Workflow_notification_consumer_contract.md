# Workflow notification - async consumer contract `Sprint 0`

Ce document stabilise le contrat async de `N02.1`.

Dependances:

- `N01.1` catalogue des templates
- `N01.3` copy rules et fallbacks
- `docs/async-events-p1.md`

## 1. Objectif

Definir comment `notification-service` consomme les evenements metier et
les transforme en demandes d'envoi tracables.

Le contrat doit figer:

- les evenements sources
- le mapping vers `templateId`
- les donnees minimales de contexte
- les statuts techniques `PENDING`, `SENT`, `FAILED`
- les regles de deduplication et de correlation

## 2. Evenements sources couverts

| Event source | Producteur | Template cible | Canal initial | Cible |
| --- | --- | --- | --- | --- |
| `registration.confirmed` | `registration-service` | `EMAIL_REGISTRATION_CONFIRMED` | `EMAIL` | participant |
| `registration.waitlisted` | `registration-service` | `EMAIL_REGISTRATION_WAITLISTED` | `EMAIL` | participant |
| `registration.promoted` | `registration-service` | `EMAIL_REGISTRATION_PROMOTED` | `EMAIL` | participant |
| `event.cancelled` | `event-management-service` | `EMAIL_EVENT_CANCELLED` | `EMAIL` | participants impactes |
| `notification.email.requested` | service source explicite | `templateId` fourni | `EMAIL` | destinataire du message |

Note:

- `EMAIL_EVENT_REMINDER` est branche plus tard par `N05.*`
- `ticket.generated` n'est pas un trigger direct d'envoi; il enrichit les
  messages si le billet est deja disponible

## 3. Contrat d'entree canonicalise

Avant envoi, tout message doit etre transforme en commande interne
`NotificationDispatchRequest`:

```json
{
  "messageId": "c8eb99e6-30d8-4a0f-8d2a-123456789abc",
  "templateId": "EMAIL_REGISTRATION_CONFIRMED",
  "channel": "EMAIL",
  "recipientUserId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "recipientEmail": "participant@example.com",
  "correlationId": "req-123",
  "context": {
    "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
    "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
    "eventTitle": "Forum Tech Casablanca"
  }
}
```

Champs obligatoires:

- `messageId`
- `templateId`
- `channel`
- `recipientUserId` ou autre identifiant destinataire stable
- `correlationId`
- `context`

## 4. Mapping evenements -> templates

### `registration.confirmed`

- template: `EMAIL_REGISTRATION_CONFIRMED`
- contexte minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `eventTitle?`
  - `registrationStatus = CONFIRMED`
  - `ticketDownloadUrl?`

### `registration.waitlisted`

- template: `EMAIL_REGISTRATION_WAITLISTED`
- contexte minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `registrationStatus = WAITLISTED`
  - `waitlistPosition?`

### `registration.promoted`

- template: `EMAIL_REGISTRATION_PROMOTED`
- contexte minimal:
  - `registrationId`
  - `eventId`
  - `participantId`
  - `registrationStatus = CONFIRMED`
  - `promotedAt`
  - `ticketDownloadUrl?`

### `event.cancelled`

- template: `EMAIL_EVENT_CANCELLED`
- contexte minimal:
  - `eventId`
  - `eventTitle`
  - `cancelReasonCode?`
  - population destinataire resolue via inscriptions impactees

### `notification.email.requested`

- bypass du mapping statique:
  le producer fournit explicitement `templateId`, `recipientUserId`,
  `context`

## 5. Cycle de vie technique

| Statut | Signification | Quand l'ecrire |
| --- | --- | --- |
| `PENDING` | message accepte par le worker, avant tentative d'envoi | a la prise en charge dedupee |
| `SENT` | tentative consideree reussie | apres confirmation du provider/mock |
| `FAILED` | tentative echouee | apres erreur de rendu, validation ou provider |

Regles:

- un message ne doit pas produire plusieurs lignes logiques pour un meme
  `messageId` sans raison explicite de retry
- `SENT` et `FAILED` sont terminaisons techniques de la tentative
  courante

## 6. Deduplication et idempotence

- la cle minimale de deduplication est `messageId`
- un replay d'evenement ne doit pas provoquer de doublon logique
- si le consumer recoit un `messageId` deja traite:
  - rejouer en lecture si necessaire
  - ne pas recreer de demande d'envoi

## 7. `NotificationLog` minimal

Chaque tentative doit pouvoir ecrire:

- `notificationId`
- `messageId`
- `templateId`
- `channel`
- `recipientUserId`
- `eventId?`
- `registrationId?`
- `status`
- `errorCode?`
- `errorMessage?`
- `providerMessageId?`
- `attemptNumber`
- `processedAt`
- `correlationId`

## 8. Observabilite et audit

- journaliser reception event, decision template, succes/echec rendu,
  succes/echec envoi
- propager `correlationId` du producer vers `NotificationLog`
- incrementer les metriques notification alignees sur `M03.1`
  (`notification_send_total`, `notification_send_failed_total`,
  `notification_send_duration_ms`)

## 9. Hors scope de `N02.1`

- implementation du worker d'envoi
- persistence concrete de `NotificationLog`
- retries et DLQ (`N04.*`)
- rappels planifies (`N05.*`)

## 10. Sortie attendue

`N02.1` est valide quand:

- les evenements sources et leurs templates cibles sont fixes
- `NotificationDispatchRequest` est explicite
- les statuts `PENDING/SENT/FAILED` sont stabilises
- les regles de deduplication et de correlation sont documentees
