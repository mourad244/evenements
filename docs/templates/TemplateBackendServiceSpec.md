# Backend Service Spec - Template Evenements

> Lire `docs/workflows/Workflow_backend.md` avant de remplir ce template.

## 0. Meta

- **Service name**
  Exemple: `registration-service`, `ticketing-service`

- **Business domain**
  Exemple: "Gerer les inscriptions, capacites, annulations et promotions
  de liste d'attente."

- **Phase cible**
  `P1`, `P2`, `P3` ou `P4`

## 1. Domain model

- **Entites principales**
  - Nom
  - Champs clefs
  - Relations
  - Source de verite

- **Statuts / transitions**
  - enums metier
  - transitions autorisees
  - transitions interdites

## 2. API surface

Pour chaque endpoint:

- methode + route
- objectif
- query params / body
- reponse de succes
- erreurs attendues
- role ou permission requis
- idempotence requise ou non

## 3. Evenements asynchrones

Pour chaque evenement:

- nom d'evenement
- producteur
- consommateurs attendus
- payload minimal
- conditions d'emission
- comportement sur retry

## 4. Validation & business rules

- champs obligatoires
- contraintes de coherence
- regles inter-entites
- verifications de concurrence / unicite

## 5. Securite & audit

- type d'auth
- roles / permissions
- actions a journaliser
- donnees sensibles a proteger

## 6. Observabilite

- health checks
- logs structures
- metriques metier minimales
- correlation-id

## 7. Integrations externes

- autres microservices appeles
- provider externe eventuel
- mode sync ou async

## 8. Tests minimaux

- smoke routes principales
- tests `401/403/200`
- tests des transitions critiques
- tests de non-regression metier

## 9. Definition of Done

- spec completee
- contrat API clair
- evenements async clairs
- securite / audit / observabilite notes
- sprint et backlog references
