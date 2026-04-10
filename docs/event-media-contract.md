---
title: Event Media Contract
description: Contrat P1 pour les references media des evenements et leur exposition au catalogue.
docKind: workflow
domain: event-management
phase: P1
owner: Mourad
status: DONE
tags:
  - events
  - media
  - catalog
slug: event-media-contract
---

# Contrat media evenement

Ce document fige le contrat minimal de `E04.1` pour que
`event-management-service`, le frontend organisateur et le catalogue
public manipulent la meme reference media.

## 1. Objectif

Le lot `P1` ne transporte pas de binaire. La source de verite du media
reste un chemin public ou une reference de ressource. Le contrat doit
permettre:

- a l'organisateur de renseigner une image de couverture;
- au service evenement de valider et persister la reference;
- au catalogue public de l'afficher sans exposition de donnees privees.

## 2. Ownership

- `event-management-service` reste owner de la reference media associee
  a un `Event`.
- `catalog-search-service` et le frontend public ne consomment que la
  valeur lue et ne modifient pas la ressource.
- le stockage d'un fichier binaire, un objet presigne ou un CDN
  dedie sont hors scope de ce slice.

## 3. Modele de donnees

### `MediaAsset` logique

Le modele logique attendu peut rester implicite en base au MVP, mais le
contrat expose au minimum:

- `coverImageRef`: chemin public ou reference lisible par le frontend;
- `imageUrl`: alias de lecture retourne au catalogue et a l'UI;
- `mediaType`: reserve pour extension future;
- `mediaStatus`: reserve pour moderation ou publication plus tard.

### Regles de format

- `coverImageRef` est optionnel.
- si present, la valeur doit etre une chaine non vide.
- le chemin doit commencer par `/`.
- la longueur maximale retenue est de `2048` caracteres.
- les URL distantes directes restent hors scope de ce lot.

Exemples valides:

- `/images/event-media-demo.svg`
- `/media/events/atlas-summit-cover.jpg`

Exemples invalides:

- `event-media-demo.svg`
- `https://cdn.example.com/event.jpg`
- une chaine vide ou uniquement des espaces

## 4. API contract

### Creation de brouillon

`POST /api/events/drafts`

Body ajoute:

- `coverImageRef?`

Rendu attendu:

- si la reference est valide, elle est stockee telle quelle;
- si elle est absente, la valeur reste `null`.

### Mise a jour de brouillon

`PATCH /api/events/drafts/{eventId}`

Body ajoute:

- `coverImageRef?`

Rendu attendu:

- un brouillon peut recevoir, remplacer ou supprimer sa reference media;
- une valeur vide ou non conforme doit produire une erreur de
  validation.

### Lecture publique

`GET /api/catalog/events`
`GET /api/catalog/events/{eventId}`

Champs exposes:

- `coverImageRef`
- `imageUrl`

Regle:

- le frontend public utilise `imageUrl` en priorite;
- si aucune image n'est fournie, il retombe sur son placeholder local.

## 5. Validation et erreurs

Erreurs attendues:

- `400` pour un format invalide;
- `401` ou `403` pour les flux proteges;
- `404` si le brouillon ou l'evenement est introuvable;
- `422` si la reference media viole une regle metier plus stricte.

Message de validation recommande:

- `coverImageRef must be a public path that starts with /`

## 6. UX organiser

- le champ media doit etre explique comme une reference publique;
- la saisie doit afficher une aide textuelle et un message d'erreur
  accessible;
- la valeur doit etre reprise dans l'edition d'un brouillon;
- la suppression de la valeur doit revenir au placeholder par defaut
  cote catalogue.

## 7. UX catalogue

- les cartes catalogue affichent l'image de couverture si elle existe;
- la fiche detail affiche le meme media pour conserver une experience
  coherente;
- l'absence de media ne doit pas casser la grille ni le layout detail.

## 8. Hors scope

- upload binaire direct en multipart
- traitement de transformation d'image
- moderation de media
- redimensionnement server-side
- signatures temporaires ou URLs presignees

## 9. Sortie attendue

`E04.1` est valide quand:

- le format de `coverImageRef` est documente;
- les payloads create/update acceptent la reference;
- le catalogue sait exposer et afficher le media public;
- l'implementation peut evoluer vers un vrai uploader sans casser le
  contrat lecteur actuel.
