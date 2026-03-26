---
title: Workflow backend event domain
description: Mode de delivery backend pour le domaine evenement et ses interfaces.
docKind: workflow
domain: event-domain
phase: P1-P2
owner: Mourad
status: DONE
tags:
  - workflow
  - backend
  - events
slug: backend-event-domain
---

# Backend workflow - delivery d'une fonctionnalite evenement en bout en bout

Utiliser ce workflow quand une fonctionnalite impacte un ou plusieurs
services du projet evenements.

## 1. Identifier le service proprietaire

Avant de coder, repondre a ces questions:

- Qui possede la regle metier principale?
- Quelle donnee est la source de verite?
- Quel service publie les changements?
- Quels services ne font que reactiver un evenement derive?

Exemples:

- creer/publier un evenement -> `Event Management`
- confirmer une inscription -> `Registration`
- generer un billet -> `Ticketing`
- envoyer un rappel -> `Notification`

## 2. Choisir le bon mode d'integration

- Besoin de reponse immediate visible a l'utilisateur -> REST sync
- Traitement derive, potentiellement lent, rejouable -> message async

Ne pas faire:

- `Event Management` qui appelle directement `Notification`
  pour chaque transition.

Preferer:

- `Event Management` publie `event.published`
- `Catalog` et `Admin` reagissent selon leur besoin

## 3. Definir les contrats

Pour chaque fonctionnalite, lister:

- endpoint(s) REST
- payload(s) de reponse
- evenement(s) asynchrones
- erreurs metier attendues
- roles / permissions

## 4. Integrer les concerns transverses

Toujours verifier:

- audit
- autorisation
- observabilite
- idempotence
- reprise sur echec
- impact notification

## 5. Mettre a jour la documentation projet

Avant ou pendant l'implementation:

- mettre a jour `docs/mvp_scope.md` si le scope change
- renseigner le backlog de domaine
- confirmer le sprint cible
- ajouter une release note si la fonctionnalite est livree

## 6. Checklist de fin

- service proprietaire clair
- contrats sync/async documentes
- statuts metier et transitions explicites
- audit et ACL couverts
- scenarios de recette traces
