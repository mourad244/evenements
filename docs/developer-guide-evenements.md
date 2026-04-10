---
title: Guide developpeur Evenements
description: Guide de mise en route et de lecture technique du depot reel, aligne sur le livrable HTML "Guide Dev".
docKind: guide
domain: engineering
phase: P1-P5
owner: Mourad
status: DONE
tags:
  - guide
  - developer
  - setup
  - events
slug: developer-guide-evenements
---

# Guide developpeur - Evenements

## Objet

Le HTML `AgendaGo` propose un `Guide Dev` base sur une structure
`client/server`.

Le depot actuel utilise une structure differente et plus proche de la
realite projet:

- microservices backend sous `services/`
- frontend Next.js sous `frontend/`
- portail docs Docusaurus sous `apps/docs-portal/`
- documentation canonique sous `docs/`
- suites de tests sous `tests/`

Ce guide sert donc de passerelle entre le livrable HTML et le depot
reel.

## Structure actuelle du depot

```txt
services/
  api-gateway/
  identity-access-service/
  event-management-service/
  registration-service/
  shared/
frontend/
apps/docs-portal/
docs/
tests/
tools/
```

## Commandes de base

### Documentation

- `npm run docs:start`
- `npm run docs:build`
- `npm run docs:serve`

### Frontend

- `npm run start:frontend`
- `npm run build:frontend`
- dans `frontend/`: `npm run test:run`

### Services backend

- `npm run start:gateway`
- `npm run start:identity`
- `npm run start:event-management`
- `npm run start:registration`

### Tests racine utiles

- `npm run test:s1-m01`
- `npm run test:s1-t02`
- `npm run test:s1-t05`
- `npm run test:s1-t06`
- `npm run test:s1-t07`

## Ordre de lecture recommande

1. [Livrables HTML - Evenements](./livrables-html-evenements.md)
2. [Perimetre MVP](./mvp_scope.md)
3. [Catalogue REST P1](./api-contracts-p1.md)
4. [Spec event-management-service](./services/event-management-service-spec.md)
5. [Spec registration-service](./services/registration-service-spec.md)
6. [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md)

## Conventions de travail

### Git et contributions

La reference reste:

- [Guide de contribution](./CONTRIBUTING.md)

Points clefs:

- branches `feature/*`, `fix/*`, `docs/*`;
- commits `type(scope): message`;
- mise a jour des docs quand le scope ou les contrats changent.

### Conventions backend / frontend

- [Workflow backend](./workflows/Workflow_backend.md)
- [Workflow frontend](./workflows/Workflow_frontend.md)
- [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md)

## Patterns critiques a connaitre

### Inscription / waitlist

Le coeur metier du sujet `Evenements` n'est pas le CRUD evenement, mais
la coherence du flux d'inscription:

- unicite par couple participant/evenement;
- capacite et waitlist;
- annulation + promotion;
- projection participant et organisateur.

References:

- [Dictionnaire de donnees P1](./data-dictionary-p1.md)
- [Spec registration-service](./services/registration-service-spec.md)

### Publication evenement

La publication et l'annulation doivent rester coherentes entre:

- owner organisateur;
- catalogue public;
- hooks async futurs ou deja relies.

References:

- [Spec event-management-service](./services/event-management-service-spec.md)
- [Flow publication evenement](./diagrams/flow_event_publication.md)

### Frontend event surfaces

Le frontend reel couvre deja:

- routes publiques `events`;
- detail evenement;
- dashboard participant;
- espace organisateur;
- surfaces admin.

Reference:

- [Surfaces UI et application](./ui-application-surfaces-evenements.md)

## Important par rapport au HTML

- le HTML est utile pour comprendre les livrables attendus;
- le depot fait foi pour la structure, les commandes et les routes
  reelles;
- ne pas reintroduire une structure fictive `client/server` dans la doc
  si elle contredit le monorepo courant.
