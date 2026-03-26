# Workflow documentation - Routine task history

Ce document formalise la routine de mise a jour de
`docs/task_history.md` (ticket `D06.1`).

## 1. Objectif

- Garantir une trace lisible des livrables majeurs.
- Garder un historique coherent entre code, docs, sprints et backlogs.
- Eviter les oublis de mise a jour en fin de sprint.

## 2. Quand ajouter une entree

Ajouter une entree `task_history` si au moins un des cas suivants est vrai:

- creation/modification d'un livrable de reference
  (spec service, workflow, sprint, plan, diagramme).
- implementation code qui ferme un ticket backlog.
- changement de statut sprint (ex: `IN_PROGRESS`, `DONE`).
- execution de verification importante (tests, smoke, drill restore).
- arbitrage de scope qui impacte planning/roadmap.

Ne pas ajouter d'entree pour:

- corrections typographiques mineures isolees.
- reformatage sans impact de contenu.
- changements temporaires non livres.

## 3. Format standard d'une entree

Structure imposee:

1. Titre date + sujet + ticket(s) si applicable.
2. Liste courte des livrables modifies.
3. Verification executee (si applicable).
4. Lien de coherence vers backlog/index/sprint mis a jour.

Template:

```md
## YYYY-MM-DD - <Sujet> (`<TicketID>`)

- <Livrable 1 et impact concret>.
- <Livrable 2 et impact concret>.
- Verification executee:
  `<commande>` -> `<resultat>`.
- Mise a jour du ticket `<TicketID>` en `<STATUS>` dans
  `docs/backlogs/<Backlog>.md`.
- Ajout de la reference dans `docs/DOCUMENTATION_INDEX.md`.
```

## 4. Checklist de coherence

Avant de finaliser une entree:

1. Le ticket backlog associe est synchronise (`DONE`, `PARTIAL`, etc.).
2. Les nouveaux documents sont presents dans `DOCUMENTATION_INDEX`.
3. Le sprint associe reflete bien l'avancement reel.
4. Les resultats de verification sont factuels (pas d'approximation).
5. La date est celle du jour de livraison effective.

## 5. Responsabilites

- Auteur principal:
  owner du ticket implemente.
- Relecture:
  support du ticket ou reviewer sprint.
- Frequence:
  au fil de l'eau, puis controle final en cloture de sprint.

## 6. Criteres d'acceptation (`D06.1`)

- la routine de mise a jour `task_history` est documentee.
- le format attendu est standardise et reutilisable.
- la coherence backlog/index/sprint est verifiable via checklist.
