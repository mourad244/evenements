---
title: Sprint 0 - Fondations architecture
description: Cadrage des services, contrats, statuts metier et backlog executable.
docKind: sprint
domain: delivery
phase: P0
owner: Mourad
status: DONE
priority: P0
tags:
  - sprint-0
  - architecture
  - contracts
slug: sprint-0-architecture-foundation
---

# Sprint 0 - Fondations architecture & contrats

Sprint de preparation du projet microservices evenements.

**Statut:** `READY TO START`  
**Periode indicative:** 2026-03-09 -> 2026-03-20  
**Equipe:** `Mourad` + `Ibrahim`  
**Pilotage du sprint:** `Mourad` + `Ibrahim`

## But du sprint

Produire un socle de conception assez solide pour commencer le
developpement du MVP `P1` sans ambiguite sur:

- les frontieres entre services;
- les contrats front/back;
- les statuts metier;
- les flux synchrones et asynchrones;
- la repartition de travail a 2.

## Perimetre du sprint

### Dans le sprint

- cadrage des services `P1`:
  `api-gateway`, `identity-access-service`, `event-management-service`,
  `catalog-search-service`, `registration-service`
- structure frontend cible:
  `public-portal`, `organizer-backoffice`, `admin-console`
- contrats initiaux REST et evenements metier critiques
- matrice de roles minimale
- diagrammes macro et flux critiques MVP
- backlog executable pour lancer `Sprint 1`

### Hors sprint

- implementation complete du code backend
- implementation complete du code frontend
- payment, moderation avancee, analytics
- releases/deploiements

## Resultat attendu

En fin de sprint, l'equipe doit avoir produit un cadre suffisamment
stable pour que `Sprint 1` demarre sans re-decider:

- quel service possede chaque regle metier `P1`;
- quels endpoints et evenements creer en premier;
- quels statuts et erreurs l'UI peut integrer sans refonte;
- quels headers et controles la Gateway impose aux services.

## Decisions structurantes a figer

| Domaine | Source de verite / owner | Decision a verrouiller dans `Sprint 0` | Dependances `Sprint 1` |
| --- | --- | --- | --- |
| API Gateway | `api-gateway` | routes publiques/privees, validation JWT, propagation `x-user-id`, `x-user-role`, `x-correlation-id` | `S1-M01`, `S1-M06` |
| Auth et session | `identity-access-service` | modeles `User/Role/Session`, flux `register/login/refresh/reset`, erreurs homogenes | `S1-M01` |
| Cycle de vie evenement | `event-management-service` | statuts `DRAFT/PUBLISHED/FULL/CLOSED/ARCHIVED/CANCELLED`, ownership organisateur, publication immediate | `S1-M02`, `S1-M03` |
| Catalogue public | `catalog-search-service` | read model derive, endpoints liste/detail publics, filtres MVP, consommation de `event.published` et `event.cancelled` | portail public `S1` |
| Inscriptions et capacite | `registration-service` | statuts `CONFIRMED/WAITLISTED/CANCELLED/REJECTED`, unicite participant/evenement, annulation et promotion atomique | `S1-M04`, `S1-M05` |

Notes de decoupage a verrouiller:

- `Catalog` reste un read model derive; il ne porte ni edition
  evenement ni decision de capacite.
- `Registration` porte le statut d'inscription et l'occupation des
  places; `Event Management` conserve la capacite declaree et le statut
  de l'evenement.
- `Ticketing`, `Notification` et `Admin` restent hors implementation
  `Sprint 0`, mais leurs hooks async doivent deja etre reserves dans les
  contrats.

## Livrables attendus

1. Nomenclature definitive des services `P1`.
2. Specs backend detaillees pour les 4 services coeur MVP et le contrat
   Gateway.
3. Diagrammes:
   - architecture globale
   - publication evenement
   - inscription + waitlist
4. Structure frontend cible et parcours principaux.
5. Matrice des statuts metier et des permissions minimales.
6. Catalogue REST `P1`, catalogue d'evenements async et plan de smoke
   tests.
7. Liste de taches pretes a coder pour `Sprint 1`.

## Repartition equipe

### Mourad - lead architecture/backend

- decoupage microservices
- specs backend MVP
- contrats API
- securite, JWT, Gateway, correlation-id
- statut et ownership des entites metier

### Ibrahim - lead frontend/UX

- structure frontend cible
- shells applicatifs
- parcours utilisateur MVP
- diagrammes fonctionnels et techniques
- challenge des payloads backend depuis la vue UI

### Travail commun

- revue des contrats front/back
- validation du scope `P1`
- arbitrage sync vs async
- definition des branches et de la methode Git

## Contrats minimums a verrouiller avant sortie

### REST synchrones

- `Identity & Access`: `register`, `login`, `refresh`,
  `forgot-password`, `reset-password`.
- `API Gateway`: mapping des routes publiques/privees, reponses
  `401/403`, propagation du contexte utilisateur et du
  `correlation-id`.
- `Event Management`: create/update/list drafts, publish now, regles
  `own-event`.
- `Catalog & Search`: liste publique, detail public, filtres MVP
  `theme/date/lieu`.
- `Registration`: create registration, cancel registration, historique
  participant, erreurs `409/422` sur doublons et regles metier.

Convention attendue pour les reponses:

- succes: `{ success: true, data, meta? }`
- erreur: `{ success: false, error, code?, details? }`

### Evenements async minimums

| Event | Producteur | Consommateurs cibles | Usage attendu |
| --- | --- | --- | --- |
| `event.published` | `event-management-service` | `catalog-search-service`, futurs `notification/admin` | rendre l'evenement visible en lecture |
| `event.cancelled` | `event-management-service` | `catalog-search-service`, `registration-service`, futurs `notification/admin` | retirer/mettre a jour les vues derivees |
| `registration.confirmed` | `registration-service` | futurs `ticketing`, `notification`, `admin` | confirmer une place et ouvrir les traitements derives |
| `registration.waitlisted` | `registration-service` | futurs `notification`, `admin` | tracer l'entree en attente |
| `registration.promoted` | `registration-service` | futurs `ticketing`, `notification`, `admin` | promotion waitlist apres liberation de place |
| `audit.action.recorded` | service source | futur `admin` | reserver le hook d'audit transverse |

Payload minimal a imposer sur les events critiques:

- identifiants metier (`eventId`, `registrationId`, `userId` si expose);
- statut cible ou transition;
- horodatage d'emission;
- acteur ou contexte systeme;
- `correlationId`;
- version de schema ou metadata equivalente.

## Tickets Sprint 0

### Lot Mourad

| ID | Tache | Owner | Support | Backlog refs | Sortie attendue |
| --- | --- | --- | --- | --- | --- |
| S0-M01 | Verrouiller la carte des services `P1` et leurs responsabilites | Mourad | Ibrahim | `I01`, `E01`, `R01` | Liste definitive des services MVP et de leurs frontieres |
| S0-M02 | Remplir la spec `identity-access-service` | Mourad | Ibrahim | `I01`, `I03`, `I04` | Spec backend completee |
| S0-M03 | Remplir la spec `event-management-service` | Mourad | Ibrahim | `E01`, `E02`, `E03` | Spec backend completee |
| S0-M04 | Remplir la spec `catalog-search-service` | Mourad | Ibrahim | `E03`, `F01` | Spec backend completee |
| S0-M05 | Remplir la spec `registration-service` | Mourad | Ibrahim | `R01`, `R02`, `R03` | Spec backend completee |
| S0-M06 | Definir le contrat Gateway, JWT et permissions minimales | Mourad | Ibrahim | `I03`, `I04`, `F04` | Contrat auth/Gateway et permissions MVP |
| S0-M07 | Definir les evenements metier `P1` et leurs payloads minimaux | Mourad | Ibrahim | `E03`, `R03`, `D04` | Liste d'evenements async avec producteurs/consommateurs |

### Lot Ibrahim

| ID | Tache | Owner | Support | Backlog refs | Sortie attendue |
| --- | --- | --- | --- | --- | --- |
| S0-I01 | Definir la structure frontend cible | Ibrahim | Mourad | `F01`, `F02`, `F03` | Arborescence cible des apps/modules frontend |
| S0-I02 | Cartographier les parcours MVP utilisateur/organisateur | Ibrahim | Mourad | `F01`, `F02`, `F03`, `R05` | Routes et parcours majeurs documentes |
| S0-I03 | Produire le diagramme d'architecture globale | Ibrahim | Mourad | `D03` | Diagramme macro pret |
| S0-I04 | Produire le diagramme publication evenement | Ibrahim | Mourad | `D03`, `E03` | Diagramme de flux pret |
| S0-I05 | Produire le diagramme inscription + waitlist | Ibrahim | Mourad | `D03`, `R01`, `R03` | Diagramme de flux pret |
| S0-I06 | Definir les besoins UI qui impactent les contrats backend | Ibrahim | Mourad | `F04`, `F05`, `D04` | Liste de feedback UI sur payloads/statuts |

### Lot commun

| ID | Tache | Owner | Support | Backlog refs | Sortie attendue |
| --- | --- | --- | --- | --- | --- |
| S0-C01 | Revue commune des 4 specs backend MVP | Mourad + Ibrahim | - | `D04` | Specs alignees front/back |
| S0-C02 | Valider le vocabulaire metier visible dans l'UI | Mourad + Ibrahim | - | `E01`, `R01`, `R03`, `F02` | Statuts et labels stabilises |
| S0-C03 | Preparer la liste de branches/taches pour `Sprint 1` | Mourad + Ibrahim | - | roadmap + backlogs | Board de demarrage `Sprint 1` |

## Ordre d'execution recommande

### Semaine 1

1. `S0-M01` - carte des services
2. `S0-I01` - structure frontend
3. `S0-M02` + `S0-M03`
4. `S0-I03` - architecture globale
5. `S0-M06` - Gateway/JWT/permissions

### Semaine 2

1. `S0-M04` + `S0-M05`
2. `S0-M07` - evenements async
3. `S0-I04` + `S0-I05`
4. `S0-I06`
5. `S0-C01` + `S0-C02` + `S0-C03`

## Branches conseillees

- `docs/sprint0-service-map`
- `docs/spec-identity-access-service`
- `docs/spec-event-management-service`
- `docs/spec-catalog-search-service`
- `docs/spec-registration-service`
- `docs/api-contracts-p1`
- `docs/async-events-p1`
- `docs/test-plan-smoke-mvp`
- `docs/frontend-target-structure`
- `docs/diagram-architecture-global`
- `docs/diagram-event-publication`
- `docs/diagram-registration-waitlist`

## Fichiers cibles a produire / enrichir

### Documentation backend

- `docs/templates/TemplateBackendServiceSpec.md` comme base
- futur dossier suggere:
  - `docs/services/identity-access-service-spec.md`
  - `docs/services/event-management-service-spec.md`
  - `docs/services/catalog-search-service-spec.md`
  - `docs/services/registration-service-spec.md`

### Contrats transverses

- `docs/data-dictionary-p1.md`
- `docs/api-contracts-p1.md`
- `docs/async-events-p1.md`
- `docs/test-plan-smoke-mvp.md`
- `docs/test-plan-role-regression.md`

### Documentation frontend

- `docs/workflows/Workflow_frontend.md`
- `docs/diagrams/README.md`
- diagrammes a ajouter dans `docs/diagrams/`

## Arbitrages ouverts a trancher dans `Sprint 0`

- `User Profile` reste-t-il un service dedie a partir du `Sprint 1`, ou
  bien un premier endpoint de lecture participant peut-il etre porte par
  `Registration` pour le vertical slice initial.
- `Registration` verifie-t-il l'ouverture a l'inscription via appel sync
  vers `Event Management`, ou via une projection minimale locale.
- Quel niveau de detail du catalogue public est necessaire en `P1` pour
  ne pas melanger donnees publiques et donnees internes organisateur.
- Quel est le niveau minimal de filtres MVP a figer pour le portail
  public afin de ne pas bloquer `F01.2` et `F01.3`.

## Definition of Done

Le sprint est termine seulement si:

- chaque user story `P1` a un service proprietaire explicite;
- les frontieres entre `Event Management`, `Catalog` et `Registration`
  sont valides;
- les contrats auth/JWT/Gateway/permissions sont documentes;
- les statuts `Event` et `Registration` sont stabilises;
- les routes publiques/privees et les headers de contexte sont figes;
- les codes `400`, `401`, `403`, `404`, `409`, `422` sont alloues aux
  flux critiques;
- les evenements async critiques sont listes avec leurs producteurs /
  consommateurs;
- chaque contrat critique mentionne ACL, idempotence et observabilite
  minimale;
- les 3 diagrammes sont disponibles;
- une liste de taches prêtes à coder existe pour `Sprint 1`.

## Risques / vigilance

- Risque de decoupage trop fin ou trop monolithique.
- Ambiguite possible entre `Catalog` et `Event Management`.
- Ambiguite possible entre `Registration`, `Ticketing` et `Payment`.
- Risque d'oublier les besoins UI pendant l'ecriture des contrats backend.
- Risque de lancer le code avant d'avoir stabilise les statuts et
  permissions.

## Sortie attendue du sprint

En fin de `Sprint 0`, l'equipe doit pouvoir dire:

1. quels services construire en premier;
2. quels endpoints et evenements creer;
3. quelles branches ouvrir pour `Sprint 1`;
4. qui fait quoi entre Mourad et Ibrahim;
5. quels points restent hors scope MVP.
