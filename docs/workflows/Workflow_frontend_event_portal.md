---
title: Workflow frontend portal evenement
description: Parcours cibles du portail public et des interfaces evenement.
docKind: workflow
domain: frontend-event-portal
phase: P1-P2
owner: Ibrahim
status: DONE
tags:
  - workflow
  - portal
  - events
slug: frontend-event-portal
---

# Frontend workflow - parcours evenement cote utilisateur et organisateur

Utiliser ce workflow pour decouper un ecran ou un module frontend du
projet evenements.

## 1. Choisir le contexte d'usage

- public: consultation sans login
- participant: inscription, historique, billet
- organisateur: creation, publication, inscrits
- admin: moderation, audit, supervision

Le contexte determine:

- le niveau d'auth;
- les actions affichables;
- les donnees a precharger;
- les erreurs a exposer.

## 2. Structurer chaque parcours

### Catalogue public

- page liste / calendrier
- filtres visibles
- detail evenement
- CTA clair vers inscription

### Espace participant

- statut d'inscription
- messages d'etat waitlist / promotion
- billet telechargeable si confirme

### Back-office organisateur

- liste des evenements
- formulaire brouillon / publication
- vue inscrits / export

### Console admin

- file moderation
- journaux d'audit
- KPI et alertes

## 3. Etats d'interface obligatoires

- aucun resultat
- evenement complet
- inscription en attente
- billet indisponible
- notification en echec si visible

## 4. Checklist UX minimale

- libelles de statuts coherents avec le backend
- actions sensibles confirmees
- erreurs reseau distinguees des erreurs metier
- navigation mobile acceptable
- messages clairs pour les roles non autorises

## 5. Checklist de fin

- route et guard correctement choisis
- chargements, erreurs et vide geres
- ACL alignee avec backend
- endpoints et payloads documentes
