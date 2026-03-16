# Workflow notification - template catalog `Sprint 0`

Ce document stabilise le catalogue des templates transactionnels pour
`N01.1`.

Dependances:

- `R01.1` creation inscription
- `R03.1` annulation/promotion
- `E06.1` annulation evenement

## 1. Objectif

Fixer la liste minimale des templates notification afin que:

- `N01.2` puisse implementer les contenus sans question ouverte
- `N02.1` puisse mapper les evenements async vers un `templateId`
- les journaux `NotificationLog` gardent une taxonomie stable

## 2. Canaux couverts

- `EMAIL` obligatoire en lot initial
- `SMS` reste derive et simule en `N03.*`

## 3. Catalogue MVP

| Template ID | Canal | Trigger principal | Cible | Usage |
| --- | --- | --- | --- | --- |
| `EMAIL_REGISTRATION_CONFIRMED` | `EMAIL` | `registration.confirmed` | participant | Confirmer une inscription directe et exposer le billet si disponible |
| `EMAIL_REGISTRATION_WAITLISTED` | `EMAIL` | `registration.waitlisted` | participant | Informer l'entree en liste d'attente |
| `EMAIL_REGISTRATION_PROMOTED` | `EMAIL` | `registration.promoted` | participant | Informer la promotion depuis la waitlist |
| `EMAIL_EVENT_REMINDER` | `EMAIL` | rappel planifie | participant | Rappeler la proximite de l'evenement |
| `EMAIL_EVENT_CANCELLED` | `EMAIL` | `event.cancelled` | participant | Informer l'annulation d'un evenement |

## 4. Variables de contexte minimales

Tous les templates doivent pouvoir recevoir:

- `recipientUserId`
- `recipientEmail`
- `firstName?`
- `eventId`
- `eventTitle`
- `correlationId`

Variables additionnelles par template:

| Template ID | Variables specifiques minimales |
| --- | --- |
| `EMAIL_REGISTRATION_CONFIRMED` | `registrationId`, `registrationStatus`, `ticketDownloadUrl?`, `eventDate?`, `eventLocation?` |
| `EMAIL_REGISTRATION_WAITLISTED` | `registrationId`, `registrationStatus`, `waitlistPosition?` |
| `EMAIL_REGISTRATION_PROMOTED` | `registrationId`, `registrationStatus`, `ticketDownloadUrl?`, `promotedAt?` |
| `EMAIL_EVENT_REMINDER` | `registrationId`, `eventDate`, `eventTime?`, `eventLocation?` |
| `EMAIL_EVENT_CANCELLED` | `registrationId?`, `cancelReasonCode?` |

## 5. Regles de mapping template

- un template est choisi par `templateId`, jamais par texte libre
- la source metier choisit le `templateId` selon le type d'evenement
- le rendu final reste owner `notification-service`
- si un champ optionnel manque, appliquer les fallback de `N01.3`

## 6. Statuts techniques cibles

Les templates alimentent des messages traces dans `NotificationLog`
avec les statuts:

- `PENDING`
- `SENT`
- `FAILED`
- `SIMULATED` pour le lot SMS de `N03.*`

## 7. Observabilite minimale

Pour chaque message prepare a partir d'un template, journaliser:

- `templateId`
- `channel`
- `recipientUserId`
- `eventId`
- `registrationId?`
- `status`
- `correlationId`

## 8. Hors scope de `N01.1`

- redaction detaillee des sujets/corps
- HTML final des emails
- traduction multi-langue

## 9. Sortie attendue

`N01.1` est valide quand:

- la liste des templates MVP est stable
- chaque trigger metier majeur a un `templateId`
- les variables minimales sont explicites
- les statuts techniques cibles sont alignes avec `N02.*`
