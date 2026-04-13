---
title: Surfaces UI et application Evenements
description: Correspondance entre les maquettes HTML AgendaGo et les routes, workflows et fonctionnalites reelles du depot.
docKind: catalog
domain: frontend
phase: P1-P3
owner: Ibrahim
status: DONE
tags:
  - frontend
  - ui
  - application
  - events
slug: ui-application-surfaces-evenements
---

# Surfaces UI et application - Evenements

## Objet

Le HTML du sujet `Evenements` expose deux livrables differents:

- `Maquettes UI`
- `Application`

Dans le depot, ces deux dimensions sont suivies ensemble: parcours UX,
routes reelles, composants frontend et vues de gestion.

## Baseline HTML a couvrir

Les maquettes `AgendaGo` du HTML ciblent cinq surfaces principales:

| Maquette HTML | Intention UX | Surface repo la plus proche | Etat documentaire |
| --- | --- | --- | --- |
| Calendrier public | decouverte, filtres, categories, disponibilite | `frontend/src/app/(public)/page.tsx`, `frontend/src/app/(public)/events/page.tsx`, `frontend/src/features/events/components/event-filters.tsx` | couverte |
| Detail evenement | detail public, jauge, CTA inscription | `frontend/src/app/(public)/events/[eventId]/page.tsx`, `frontend/src/features/events/components/event-details.tsx` | couverte |
| Dashboard organisateur | stats et liste des evenements | `frontend/src/app/(dashboard)/organizer/events/page.tsx`, `frontend/src/features/events/api/get-organizer-events.ts` | couverte |
| Creer un evenement | formulaire draft/publication | `frontend/src/features/events/components/event-form.tsx`, mutations create/update/publish | couverte |
| Espace participant | mes inscriptions, historique, billet, waitlist | `frontend/src/app/(dashboard)/my-registrations/page.tsx`, `frontend/src/features/registrations/components/registration-list.tsx` | couverte |

## Vues application du HTML

L'onglet `Application` du HTML met l'accent sur six vues CRUD:

| Vue HTML | Equivalent repo | Source canonique |
| --- | --- | --- |
| Dashboard | dashboard utilisateur et organisateur | [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md) |
| Events | listing public + gestion organisateur | `frontend/src/features/events/` |
| Registrations | inscriptions participant et liste organisateur | `frontend/src/features/registrations/` |
| Waitlist | etat waitlist dans les listes/CTA | `frontend/src/features/registrations/`, tests `s2-t11` a `s2-t14` |
| Categories | filtres et taxonomie evenement | [Dictionnaire de donnees P1](./data-dictionary-p1.md), `event-filters.tsx` |
| Presence | ticket/QR/presence le jour J | [Strategie de tests](./testing-strategy-evenements.md), lot ticketing `P2` |

## Routes reelles du frontend

Le HTML montre un produit monolithique `AgendaGo`. Le depot courant
expose deja des routes structurees:

### Public

- `/`
- `/events`
- `/events/[eventId]`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Dashboard / participant

- `/dashboard`
- `/my-registrations`

### Organisateur

- `/organizer/events`

### Admin

- `/admin/events`
- `/admin/users`

## Mapping fonctionnel

| Capacite visible dans le HTML | Ou la retrouver dans le repo |
| --- | --- |
| filtres catalogue / calendrier | `frontend/src/features/events/components/event-filters.tsx` |
| cartes evenement | `frontend/src/features/events/components/event-card.tsx` |
| detail evenement + CTA | `frontend/src/features/events/components/event-details.tsx`, `registration-button.tsx` |
| inscription / desinscription | `register-to-event.ts`, `cancel-registration.ts` |
| historique participant | `get-my-registrations.ts`, `registration-list.tsx` |
| gestion organisateur | `get-organizer-events.ts`, `event-form.tsx`, `publish-event.ts` |
| liste inscrits organisateur | `get-organizer-event-registrations.ts`, `organizer-registrations-list.tsx` |

## Ce qui est deja aligne

- separation claire des surfaces `public / participant / organisateur /
  admin`;
- composants et hooks distincts par domaine (`events`,
  `registrations`, `auth`, `admin`);
- tests frontend de routes et de raffinements UX sur les espaces publics
  et dashboard;
- documentation workflow deja existante pour les parcours portail et les
  etats UI.

## Ce qui reste une cible issue du HTML

- vue calendrier riche type `FullCalendar` comme ecran pivot;
- vue presence/check-in explicite en tant qu'ecran dedie;
- vue categories et waitlist comme pages de gestion autonomes plutot que
  simples sous-etats;
- transposition exacte des maquettes HTML en design final si ce niveau
  de fidelite est souhaite.

## Documents a utiliser avec cette page

- [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md)
- [Workflow frontend](./workflows/Workflow_frontend.md)
- [Workflow frontend shared states](./workflows/Workflow_frontend_shared_states.md)
- [Backlog Frontend](./backlogs/BackLog_frontend.md)
- [Backlog Registration & Ticketing](./backlogs/BackLog_registration_ticketing.md)
