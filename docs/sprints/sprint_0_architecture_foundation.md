# Sprint 0 - Fondations architecture & contrats

Sprint de preparation du projet microservices evenements.

**Statut:** `READY TO START`  
**Periode indicative:** 2026-03-09 -> 2026-03-20  
**Equipe:** `Mourad` + `Ibrahim`

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

## Livrables attendus

1. Nomenclature definitive des services `P1`.
2. Specs backend detaillees pour les 4 services coeur MVP.
3. Diagrammes:
   - architecture globale
   - publication evenement
   - inscription + waitlist
4. Structure frontend cible et parcours principaux.
5. Matrice des statuts metier et des permissions minimales.
6. Liste de taches pretes a coder pour `Sprint 1`.

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

## Tickets Sprint 0

### Lot Mourad

| ID | Tache | Owner | Support | Backlog refs | Sortie attendue |
| --- | --- | --- | --- | --- | --- |
| S0-M01 | Verrouiller la carte des services `P1` et leurs responsabilites | Mourad | Ibrahim | `I01`, `E01`, `R01` | Liste definitive des services MVP et de leurs frontieres |
| S0-M02 | Remplir la spec `identity-access-service` | Mourad | Ibrahim | `I01`, `I03`, `I04` | Spec backend completee |
| S0-M03 | Remplir la spec `event-management-service` | Mourad | Ibrahim | `E01`, `E02`, `E03` | Spec backend completee |
| S0-M04 | Remplir la spec `catalog-search-service` | Mourad | Ibrahim | `E03`, `F01` | Spec backend completee |
| S0-M05 | Remplir la spec `registration-service` | Mourad | Ibrahim | `R01`, `R02`, `R03` | Spec backend completee |
| S0-M06 | Definir la matrice auth/JWT/permissions minimale | Mourad | Ibrahim | `I03`, `I04`, `F04` | Contrat auth et permissions MVP |
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
5. `S0-M06` - auth/JWT/permissions

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

### Documentation frontend

- `docs/workflows/Workflow_frontend.md`
- `docs/diagrams/README.md`
- diagrammes a ajouter dans `docs/diagrams/`

## Definition of Done

Le sprint est termine seulement si:

- chaque user story `P1` a un service proprietaire explicite;
- les frontieres entre `Event Management`, `Catalog` et `Registration`
  sont valides;
- les contrats auth/JWT/permissions sont documentes;
- les statuts `Event` et `Registration` sont stabilises;
- les evenements async critiques sont listes avec leurs producteurs /
  consommateurs;
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
