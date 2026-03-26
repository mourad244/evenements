---
title: Workflow backend
description: Conventions backend transverses du projet Evenements.
docKind: workflow
domain: backend
phase: P1-P4
owner: Mourad
status: DONE
tags:
  - workflow
  - backend
  - conventions
slug: backend
---

# Backend workflow - patterns partages pour les microservices evenements

Ce document fixe les conventions backend a reutiliser dans tous les
services du projet.

## 1. Structure de service recommandee

```txt
src/
  index.ts|js
  routes/
  controllers/
  services/
  repositories/
  validation/
  events/
  middleware/
  lib/
  utils/
  config/
tests/
  helpers/
  smoke.*
```

## 2. Regles de responsabilite

- Un service possede son domaine metier et ses regles.
- Un service n'ecrit pas directement dans la base d'un autre service.
- Les traitements derives doivent preferer des evenements async plutot
  qu'un chainage synchrone excessif.
- Les routes restent minces; la logique vit dans `services/`.

## 3. Contrats API

- Versionner les routes au besoin depuis la Gateway.
- Reponse de succes recommandee:
  `{ success: true, data, meta? }`
- Reponse d'erreur recommandee:
  `{ success: false, error, code?, details? }`
- Toujours documenter:
  - auth requise ou non
  - roles attendus
  - idempotence
  - codes `200/201/400/401/403/404/409/500`

## 4. Modelisation des statuts metier

- Garder des enums explicites pour `Event`, `Registration`, `Payment`,
  `Notification`, `Ticket`.
- Documenter les transitions autorisees.
- Bloquer les transitions illegales au niveau service, pas seulement en UI.

## 5. Flux sync vs async

Utiliser le synchrone pour:

- login / refresh;
- lecture de donnees courantes;
- validation immediate d'une inscription;
- consultation d'un profil ou d'un evenement.

Utiliser l'asynchrone pour:

- generation de billet;
- envoi de notifications;
- indexation catalogue derivee;
- audit transversal;
- rappels programmes.

## 6. Securite

- Auth centralisee via Gateway + middleware de verification.
- Propager le contexte utilisateur et le correlation-id.
- Appliquer l'autorisation dans chaque service sensible.
- Journaliser les actions critiques.

## 7. Idempotence et concurrence

- Les endpoints d'inscription et de paiement doivent gerer les retries
  sans doublon.
- Les promotions de waitlist doivent etre atomiques.
- Les consumers d'evenements doivent etre idempotents.

## 8. Observabilite

- `/health` et `/ready` sur chaque service.
- Logs structures avec nom du service, niveau, correlation-id,
  entite cible et resultat.
- Metriques minimales:
  latence, erreurs, volumetrie, delais de traitement async.

## 9. Tests minimaux

- smoke tests de routes principales;
- tests de permissions `401/403/200`;
- tests des transitions de statuts critiques;
- tests de non-double execution pour inscription/waitlist/ticket.
