# Guide de Contribution - Projet Evenements

> Public cible: equipe produit, architecte, dev backend, dev frontend, ops  
> Derniere mise a jour: 2026-03-07

## Code de conduite

- Communiquer les hypotheses et les blocages tot.
- Eviter les decisions implicites sur le decoupage microservices.
- Documenter tout changement de scope avant implementation.
- Garder les contrats d'API et les evenements metier tracables.

## Workflow Git recommande

```txt
main
develop
feature/*
fix/*
docs/*
refactor/*
infra/*
```

## Nommage des branches

| Type | Format | Exemple |
| --- | --- | --- |
| Feature | `feature/description-courte` | `feature/registration-waitlist` |
| Fix | `fix/description-du-bug` | `fix/ticket-pdf-timeout` |
| Documentation | `docs/sujet` | `docs/mvp-scope-update` |
| Refactor | `refactor/composant-ou-service` | `refactor/catalog-query-layer` |
| Infrastructure | `infra/sujet` | `infra/rabbitmq-observability` |

## Format des commits

```txt
<type>(<scope>): <description courte>
```

Types recommandes:

- `feat`
- `fix`
- `docs`
- `refactor`
- `test`
- `chore`
- `infra`

Exemples:

```bash
git commit -m "docs(scope): align p1 backlog with cahier des charges"
git commit -m "feat(registration): add waitlist promotion flow"
git commit -m "infra(messaging): add registration event bus topology"
```

## Regles de contribution produit et architecture

- Une fonctionnalite doit appartenir a un service proprietaire unique.
- Les appels synchrones sont reserves aux validations immediates.
- Les notifications, billets et rappels doivent privilegier un flux
  asynchrone.
- Les donnees d'audit ne doivent pas rester implicites.
- Les codes de droits et roles doivent etre definis avant l'UI finale.

## Regles de contribution documentation

Toute contribution sur le scope ou l'architecture doit mettre a jour:

1. `docs/mvp_scope.md` si le perimetre ou le decoupage change.
2. Le backlog de domaine dans `docs/backlogs/`.
3. Le sprint cible dans `docs/sprints/`.
4. `docs/task_history.md` si le livrable est considere significatif.

Les fichiers de `docs/releases/` et `docs/deployments/` ne deviennent
utiles qu'a partir du premier lot deployable.

## Pull Requests / Merge Requests

Verifier avant revue:

- objectif clair;
- user story ou backlog reference;
- impacts sync/async notes;
- impacts securite notes;
- impacts observabilite notes;
- documentation alignee.

## Checklist de review

- Le service proprietaire est-il coherent avec le domaine?
- Les frontieres entre services restent-elles nettes?
- Le workflow sync/async est-il justifie?
- Les statuts et transitions metier sont-ils explicites?
- Les criteres de recette du PDF restent-ils couverts?

## Definition of Done

Une contribution est consideree complete si:

- le besoin est trace dans la documentation projet;
- les conventions backend/frontend restent coherentes;
- les dependances inter-services sont explicites;
- les risques et points ouverts sont identifies.
