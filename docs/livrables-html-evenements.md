---
title: Livrables HTML - Evenements
description: Alignement entre le livrable HTML "Sujet 2 - Evenements" et la documentation canonique du depot.
docKind: index
domain: documentation
phase: P1-P3
owner: Mourad
status: DONE
tags:
  - docs
  - livrables
  - html
  - alignment
slug: livrables-html-evenements
---

# Livrables HTML - Sujet 2 "Evenements"

## Objet

Le fichier HTML `livrables-techniques-sujets-fullstack.html` sert de
reference pedagogique pour le sujet `Evenements` sous la forme
`AgendaGo`.

Le depot courant reste toutefois la source de verite pour:

- l'architecture reelle du projet;
- le decoupage microservices;
- les contrats exposes par la Gateway;
- l'etat des ecrans, tests et scripts disponibles.

Ce document aligne donc la documentation du repo sur les livrables du
HTML sans ecraser la realite technique du projet.

## Regle de lecture

- le HTML definit le niveau de livrable attendu et les surfaces a
  documenter;
- les fichiers `docs/` ci-dessous sont les sources canoniques a
  consulter et maintenir;
- quand le HTML et le repo divergent, le repo fait foi pour la stack et
  l'etat d'implementation.

## Correspondance des livrables

| Livrable HTML | Ce que le HTML attend | Documentation canonique du repo | Note d'alignement |
| --- | --- | --- | --- |
| Base de donnees | modele `AgendaGo`, waitlist, contrainte `UNIQUE(event_id, user_id)`, verrou transactionnel | [Dictionnaire de donnees P1](./data-dictionary-p1.md), [Spec registration-service](./services/registration-service-spec.md), [Spec event-management-service](./services/event-management-service-spec.md) | Le repo documente la meme logique metier, mais dans une architecture microservices |
| Maquettes UI | calendrier public, detail evenement, dashboard organisateur, creation evenement, espace participant | [Surfaces UI et application](./ui-application-surfaces-evenements.md), [Workflow frontend portail evenement](./workflows/Workflow_frontend_event_portal.md) | Le HTML sert de baseline UX; le repo mappe ces surfaces vers les routes/features reelles |
| Backlog | 10 taches et priorisation du sujet | [Backlog Event Management](./backlogs/BackLog_event_management.md), [Backlog Frontend](./backlogs/BackLog_frontend.md), [Roadmap sprints](./planning/roadmap_sprints.md) | Les backlogs du repo sont plus detailles et repartis par domaine |
| Architecture | personas, flux critique, stack, ADR, MoSCoW, NFR | [Perimetre MVP](./mvp_scope.md), [Architecture globale](./diagrams/architecture_global.md), [Flow registration waitlist](./diagrams/flow_registration_waitlist.md) | Le HTML decrit un 3-tiers monolithique; le repo formalise une cible microservices |
| API Docs | endpoints auth, events, registrations, waitlist, dashboard | [Catalogue REST P1](./api-contracts-p1.md), [Evenements async P1](./async-events-p1.md), [Spec identity-access-service](./services/identity-access-service-spec.md) | Les routes du repo sont documentees cote Gateway et services owners |
| Application | vues CRUD "Dashboard / Events / Registrations / Waitlist / Categories / Presence" | [Surfaces UI et application](./ui-application-surfaces-evenements.md), [Workflow frontend](./workflows/Workflow_frontend.md) | Le repo expose deja des surfaces publiques, participant, organisateur et admin; certaines vues HTML restent cibles |
| Securite | STRIDE, OWASP, QR HMAC, ACL, race conditions | [Strategie securite Evenements](./security-strategy-evenements.md), [Plan ACL](./test-plan-role-regression.md), [Matrice de recette](./test-plan-acceptance-matrix.md) | Le repo separe explicitement les controles couverts des controles encore cibles |
| Guide Dev | workflow Git, setup local, structure projet, patterns critiques | [Guide developpeur Evenements](./developer-guide-evenements.md), [Guide de contribution](./CONTRIBUTING.md), [Quick start](./QUICK_START.md) | Le guide repo remplace la structure fictive `client/server` du HTML par la structure reelle du monorepo |
| Tests | pyramide unit / integration / E2E, cas critiques waitlist/QR | [Strategie de tests Evenements](./testing-strategy-evenements.md), [Smoke MVP](./test-plan-smoke-mvp.md), [Plan ACL](./test-plan-role-regression.md) | Le repo couvre surtout smoke, unit et integration ciblees; le HTML reste la baseline de lisibilite |

## Vue rapide par besoin

### Si l'objectif est de "respecter le HTML"

Commencer par:

1. [ce document d'alignement](./livrables-html-evenements.md)
2. [les surfaces UI et application](./ui-application-surfaces-evenements.md)
3. [la strategie securite](./security-strategy-evenements.md)
4. [la strategie de tests](./testing-strategy-evenements.md)

### Si l'objectif est de livrer une fonctionnalite

Commencer par:

1. [Perimetre MVP](./mvp_scope.md)
2. [Catalogue REST P1](./api-contracts-p1.md)
3. [Backlogs de domaine](./backlogs/BackLog_event_management.md)
4. [Roadmap des sprints](./planning/roadmap_sprints.md)

## Points d'attention

- Le HTML parle de `AgendaGo` avec `React + Vite + Express + PostgreSQL`
  dans une logique 3-tiers.
- Le depot courant documente et implemente une cible plus structuree:
  Gateway, services metier, frontend Next.js, docs portal, tests
  centralises.
- Il faut donc aligner la doc sur les livrables du HTML, pas recopier sa
  stack mot pour mot si elle contredit le repo.
