# Historique des livrables - Projet Evenements

Journal synthetique des livrables majeurs et des baselines de cadrage.

## 2026-03-07 - Baseline documentaire projet

- Structuration complete du dossier `docs/` sur le modele de `docs copy`,
  mais adaptee au domaine evenement.
- Formalisation du perimetre `P1 -> P4` dans `docs/mvp_scope.md`.
- Mise en place des backlogs initiaux par domaine:
  auth, events, registration/ticketing, notification, admin,
  payment, frontend, monitoring, documentation.
- Creation des workflows backend/frontend et du template de spec
  microservice pour lancer l'implementation.
- Conservation du dossier `docs/releases/` comme simple template futur,
  sans suivi actif pour l'instant.

## 2026-03-08 - Baseline contrats `P1` en cours de `Sprint 0`

- Renforcement de `docs/sprints/sprint_0_architecture_foundation.md`
  avec ownership `P1`, contrats minimums, arbitrages ouverts et Done
  criteria plus stricts.
- Creation du dictionnaire de donnees `P1` dans
  `docs/data-dictionary-p1.md`.
- Creation du catalogue REST `P1` dans `docs/api-contracts-p1.md`.
- Creation du catalogue d'evenements async `P1` dans
  `docs/async-events-p1.md`.
- Creation de la checklist smoke MVP dans `docs/test-plan-smoke-mvp.md`.
- Creation de la spec `identity-access-service` dans
  `docs/services/identity-access-service-spec.md`.
- Creation de la spec `event-management-service` dans
  `docs/services/event-management-service-spec.md`.
- Creation de la spec `registration-service` dans
  `docs/services/registration-service-spec.md`.
- Alignement de l'index documentaire et du backlog documentation avec
  ces nouveaux livrables.

## 2026-03-08 - Cloture des livrables documentaires restants de `Sprint 0`

- Creation de la spec `catalog-search-service` dans
  `docs/services/catalog-search-service-spec.md`.
- Creation de la matrice de recette par phase dans
  `docs/test-plan-acceptance-matrix.md`.
- Creation du plan de non-regression ACL et roles dans
  `docs/test-plan-role-regression.md`.
- Creation des trois diagrammes `Sprint 0` en source Mermaid dans
  `docs/diagrams/architecture_global.mmd`,
  `docs/diagrams/flow_event_publication.mmd` et
  `docs/diagrams/flow_registration_waitlist.mmd`.
- Mise a jour de `docs/diagrams/README.md`,
  `docs/DOCUMENTATION_INDEX.md` et `docs/backlogs/BackLog_documentation.md`
  pour referencer ces livrables.

## A completer ensuite

- Ajouter les livraisons techniques reellement implementees
  (services, contrats, UI, observabilite, releases).
- Lier chaque entree a son sprint et a son backlog de domaine.
