---
title: Diagramme registration waitlist
description: Rendu Mermaid du flux d'inscription, attente et promotion.
docKind: diagram
domain: registration
phase: P1-P2
owner: Ibrahim
status: DONE
tags:
  - diagram
  - registration
  - waitlist
slug: registration-waitlist-flow
---

# Diagramme registration waitlist

Source Mermaid canonique: `docs/diagrams/flow_registration_waitlist.mmd`

```mermaid
sequenceDiagram
  actor Participant
  participant Gateway as API Gateway
  participant Registration as Registration Service
  participant EventSvc as Event Management
  participant Bus as Message Bus
  participant Ticketing as Ticketing
  participant Notification as Notification

  Participant->>Gateway: POST /api/registrations
  Gateway->>Registration: contexte auth + eventId
  Registration->>EventSvc: Lire policy d'inscription
  alt Capacite disponible
    Registration->>Registration: creer CONFIRMED
    Registration-->>Bus: registration.confirmed
    Bus-->>Ticketing: futur ticket
  else Evenement plein
    Registration->>Registration: creer WAITLISTED
    Registration-->>Bus: registration.waitlisted
  end
  Participant->>Gateway: POST /api/registrations/{id}/cancel
  Gateway->>Registration: annuler inscription
  Registration->>Registration: liberer place + promouvoir si possible
  Registration-->>Bus: registration.promoted
```
