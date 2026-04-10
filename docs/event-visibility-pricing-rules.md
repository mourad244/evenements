---
title: Event Visibility Pricing Rules
description: Regles P1 pour la visibilite, la tarification et l'eligibilite d'acces aux evenements.
docKind: workflow
domain: event-management
phase: P1
owner: Mourad
status: DONE
tags:
  - events
  - visibility
  - pricing
slug: event-visibility-pricing-rules
---

# Regles de visibilite, tarification et eligibilite

Ce document fige le contenu attendu par `E01.3`.

## 1. Objectif

Stabiliser les valeurs de visibilite et de tarification d'un
`Event`, ainsi que les criteres d'acces attendus par le portail public,
le back-office organisateur et le service de publication.

## 2. Champ d'application

Ces regles s'appliquent a:

- la creation d'un brouillon evenement;
- la mise a jour d'un brouillon;
- la lecture du catalogue public;
- la publication d'un evenement;
- les verifications d'acces de base cote frontend et backend.

## 3. Visibilite

### Valeurs autorisees

- `PUBLIC`
- `PRIVATE`

### Definition

- `PUBLIC`: l'evenement peut apparaitre dans le catalogue public et
  etre detaille par les visiteurs non connectes, si son statut est
  publiable.
- `PRIVATE`: l'evenement est reserve aux flux organisauteur et ne doit
  pas etre expose dans le catalogue public.

### Regles metier

- la visibilite est fixee au moment de la creation du brouillon;
- un brouillon peut changer de visibilite avant publication;
- un evenement publie garde sa visibilite canonique pour les projections
  derivees;
- un `PRIVATE` ne doit jamais apparaitre dans `/api/catalog/events` ni
  `/api/catalog/events/{eventId}`.

## 4. Tarification

### Valeurs autorisees

- `FREE`
- `PAID`

### Definition

- `FREE`: aucun paiement n'est requis pour s'inscrire;
- `PAID`: l'evenement est payant et le prix doit etre expose cote
  frontend.

### Regles metier

- la tarification est une propriete du brouillon evenement;
- si `pricingType = PAID`, le produit front interprete le prix comme
  strictement positif;
- si `pricingType = FREE`, le montant affiche doit etre `0` ou
  represente comme gratuit;
- le frontend peut afficher la tarification comme etiquette visuelle
  sans recalculer la logique metier.

## 5. Eligibilite

### Eligibilite minimale

- un `PARTICIPANT` peut consulter le catalogue public;
- un `PARTICIPANT` peut s'inscrire sur un evenement `PUBLIC`
  publiable;
- un `ORGANIZER` peut creer, modifier, publier et lister ses evenements;
- un `ADMIN` peut lire et gerer les evenements au besoin.

### Cas particuliers

- les evenements `PRIVATE` ne sont pas ouverts a la consultation
  publique;
- les evenements `PAID` peuvent exiger un futur lot de paiement, mais le
  lot `P1` ne bloque pas encore l'inscription sur cette base dans le
  contrat courant;
- l'eligibilite metier fine par invitation, quota ou statut de compte
  est reservee a des evolutions futures.

## 6. Validation

### Creation et edition

Le service doit refuser:

- une visibilite autre que `PUBLIC` ou `PRIVATE`;
- une tarification autre que `FREE` ou `PAID`;
- une combinaison invalide de champs s'il existe une regle metier
  supplementaire documentee plus tard.

### Messages attendus

- `visibility must be PUBLIC or PRIVATE`
- `pricingType must be FREE or PAID`

## 7. Exposition frontend

- le catalogue public affiche uniquement les evenements `PUBLIC`;
- la carte evenement et la fiche detail peuvent afficher un badge de
  prix derive de `pricingType`;
- le back-office organisateur peut preparer des evenements `PRIVATE`
  avant publication;
- les libelles utilisateur doivent rester explicites sur le fait qu'un
  evenement prive ne sera pas visible publiquement.

## 8. Hors scope

- invitation code
- quota par segment utilisateur
- gestion de paiement effectif
- acces restreint par groupe
- moderation manuelle de visibilite

## 9. Sortie attendue

`E01.3` est valide quand:

- les valeurs de visibilite et tarification sont stabilisees;
- la regle catalogue public vs prive est explicite;
- les criteres d'eligibilite minimale sont fixes pour les prochaines
  phases;
- le backend et le frontend partagent le meme vocabulaire metier.
