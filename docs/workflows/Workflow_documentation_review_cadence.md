# Workflow documentation - Review cadence

Ce document definit le rituel de revue documentaire a chaque sprint
(ticket `D06.3`).

## 1. Objectif

- Garder la documentation synchronisee avec l'avancement reel.
- Eviter les ecarts entre backlogs, sprints, index et historique.
- Donner une routine simple et repetable pour une equipe de 2.

## 2. Cadence imposee

Rituel minimal par sprint:

1. Revue de kickoff (`20 min`).
2. Revue de cloture (`30 min`).

Revue intermediaire optionnelle (`10 min`) si:

- changement majeur de scope.
- blocage cross-domaine.
- ecart important entre backlog et sprint.

## 3. Roles (equipe a 2)

- Animateur:
  owner principal du sprint en cours.
- Reviewer:
  support principal du sprint.

Dans la repartition actuelle:

- `Mourad` anime par defaut les revues docs.
- `Ibrahim` valide coherence UX/front et routes de navigation doc.

## 4. Checklist kickoff sprint

1. Verifier que le sprint cible existe et a le bon statut.
2. Verifier que les tickets engages sont `TODO` ou `IN_PROGRESS`.
3. Verifier ownership `Owner/Support` par ticket prioritaire.
4. Verifier que les prerequis cross-domaine sont explicites.

## 5. Checklist cloture sprint

1. Verifier statut final des tickets (`DONE`, `PARTIAL`, `BLOCKED`).
2. Verifier mise a jour `docs/task_history.md` pour les livrables majeurs.
3. Verifier references dans `docs/DOCUMENTATION_INDEX.md`.
4. Verifier coherence roadmap/sprints/backlogs si statut sprint change.
5. Documenter les restes a faire explicites pour le sprint suivant.

## 6. Sorties attendues

Chaque revue produit:

- une courte note de decision (scope, priorites, ecarts).
- les fichiers docs effectivement modifies.
- un statut de suivi clair dans le backlog concerne.

## 7. Regle simple d'equipe

Sans revue kickoff + cloture, un sprint n'est pas considere documentairement
ferme.

## 8. Criteres d'acceptation (`D06.3`)

- une regle de revue doc par sprint est explicite.
- la cadence et les roles sont definis.
- la checklist de verification est reutilisable sans ambiguite.
