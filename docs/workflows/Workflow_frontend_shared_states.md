# Workflow frontend - shared UI states `Sprint 0`

Ce document stabilise le catalogue des etats UI communs pour `F05.1`.

Dependances:

- shells routes `F01.1`, `F02.1`, `F03.1`
- contrat ACL `F04.1`

## 1. Objectif

Definir une convention unique de feedback utilisateur pour les ecrans MVP:

- portail public
- espace participant
- back-office organisateur
- console admin

La sortie cible est une base claire pour `F05.2` (bibliotheque de composants)
et `F05.3` (deploiement sur les ecrans Sprint 1).

## 2. Etats standards obligatoires

Chaque vue de liste, detail ou formulaire doit couvrir:

- `loading`
- `empty`
- `error`
- `forbidden`
- `success`

Regle:

- un seul etat principal visible a la fois
- priorite de rendu: `forbidden` > `error` > `loading` > `empty` > contenu

## 3. Catalogue des composants partages

| Composant cible | Etat couvre | Usage principal | Contrat d'entree minimal |
| --- | --- | --- | --- |
| `StateLoading` | `loading` | chargement initial ou refresh critique | `label?`, `fullscreen?` |
| `StateEmpty` | `empty` | aucune donnee disponible | `title`, `description`, `cta?` |
| `StateError` | `error` | erreur technique/metier recuperable | `title`, `description`, `retry?`, `code?` |
| `StateForbidden` | `forbidden` | acces refuse role/permission | `title`, `description`, `backLink?` |
| `InlineSuccess` | `success` | confirmation action locale (save/publish/update) | `message`, `dismissible?` |
| `AppToast` | `success/error/info` | notification transversale non bloquante | `type`, `message`, `durationMs?` |

## 4. Conventions de contenu UX

### 4.1 Loading

- utiliser un skeleton sur les listes/cartes
- spinner plein ecran reserve au bootstrap session
- pas de contenu stale masque sans indication de refresh

### 4.2 Empty

- message orientee action, pas seulement "aucune donnee"
- CTA explicite quand une action est possible (`Creer`, `Reessayer`,
  `Voir le catalogue`)

### 4.3 Error

- montrer un message lisible + option de retry
- mapper les codes backend:
  - `401`: redirection login (pas d'ecran error standard)
  - `403`: basculer sur `StateForbidden`
  - `404`: empty metier ou not-found selon contexte
  - `5xx/502`: `StateError` avec retry

### 4.4 Success

- feedback immediat apres action confirmee
- success non bloquant via toast, success critique via banner inline

## 5. Mapping minimum par surface MVP

| Surface | Ecrans prioritaires | Etats minimum a valider |
| --- | --- | --- |
| Portail public | home, catalogue, detail evenement | `loading`, `empty`, `error` |
| Participant | login/register, dashboard, participations | `loading`, `error`, `success`, `forbidden` |
| Organisateur | liste evenements, edition, inscrits | `loading`, `empty`, `error`, `success`, `forbidden` |
| Admin | moderation, audit, kpi, incidents | `loading`, `empty`, `error`, `forbidden` |

## 6. Contrat visuel commun (niveau doc)

- espacement et grille constants pour les blocs d'etat
- icone d'etat coherente par type (`info`, `warning`, `error`, `success`)
- typographie de message stable (titre + texte court + action)
- CTA primaire unique par etat pour limiter l'ambiguite

## 7. Non-objectifs de `F05.1`

- implementation React/Vue/Angular des composants
- theming final detaille
- instrumentation analytique des interactions UX

## 8. Sortie attendue

`F05.1` est valide quand:

- le catalogue des etats partages est fige
- les regles de priorite d'affichage sont explicites
- le mapping backend errors -> etats UI est stabilise
- `F05.2` peut implementer sans arbitrage restant
