# Workflow frontend - responsive a11y checklist `Sprint 0`

Ce document fige la checklist MVP responsive et accessibilite pour `F07.1`.

Dependances:

- `F01.1` shell portail public
- `F02.1` shell participant
- `F03.1` shell organisateur
- `F05.1` standards etats UI partages

## 1. Objectif

Identifier les ecrans prioritaires et les controles a verifier avant
implementation technique `Sprint 1`:

- adaptation mobile/tablette/desktop
- navigation clavier
- labels et messages d'erreur accessibles
- lisibilite des etats `loading/error/empty/success`

## 2. Breakpoints cibles MVP

| Profil viewport | Largeur cible | Usage principal |
| --- | --- | --- |
| Mobile | `320-767px` | participant/public en deplacement |
| Tablette | `768-1023px` | consultation et actions intermediaires |
| Desktop | `>=1024px` | back-office organisateur/admin |

Regles minimales:

- aucun overflow horizontal non voulu
- CTA primaire visible sans zoom force
- tables longues avec strategy responsive (stack/scroll controlle)

## 3. Ecrans prioritaires a valider

| Domaine | Route | Priorite | Responsive | A11y |
| --- | --- | --- | --- | --- |
| Portail public | `/` | P0 | hero + cards lisibles mobile | titres hierarchises, liens explicites |
| Portail public | `/events` | P0 | filtres et liste adaptatifs | filtres focusables clavier |
| Portail public | `/events/:eventId` | P0 | contenu detail sans collision | contraste textes/CTA, structure H1/H2 |
| Auth participant | `/auth/login` | P0 | formulaire mono-colonne mobile | labels relies, erreurs annoncees |
| Auth participant | `/auth/register` | P0 | champs et actions visibles sans scroll piege | ordre tab coherent, messages associes |
| Participant | `/participant/dashboard` | P0 | cartes statut lisibles mobile | region landmarks, titres de section |
| Participant | `/participant/participations` | P1 | tableau/listing en mode compact | cellules lisibles lecteur ecran |
| Organisateur | `/organizer/events` | P1 | listing + actions sans debordement | boutons nommes, focus visible |
| Organisateur | `/organizer/events/new` | P1 | formulaire sectionne en mobile | labels, aides et erreurs contextuelles |
| Organisateur | `/organizer/events/:eventId/registrations` | P2 | table inscrits degradable mobile | alternatives clavier pour actions table |

## 4. Checklist accessibilite transverse

### 4.1 Navigation et focus

- navigation complete au clavier (`Tab`, `Shift+Tab`, `Enter`, `Space`)
- ordre de tabulation logique
- focus visible sur tout element interactif
- absence de focus trap hors composants volontairement modaux

### 4.2 Formulaires et erreurs

- chaque input possede un label explicite
- champs requis identifies sans dependre uniquement de la couleur
- message d'erreur associe au champ concerne
- resume d'erreurs global pour formulaires longs

### 4.3 Semantique et structure

- un seul `h1` par ecran
- hierarchie de titres coherente (`h1` -> `h2` -> `h3`)
- zones principales marquees (`header`, `main`, `nav`, `footer`)
- textes de liens et boutons explicites (pas de "cliquez ici")

### 4.4 Contraste et lisibilite

- contraste texte/fond conforme cible AA
- taille de police lisible sur mobile
- etats disabled/non-actifs non ambigus
- ne pas transmettre une information critique uniquement par couleur

### 4.5 Etats de chargement et feedback

- `loading`: indicateur present et non bloquant inutilement
- `empty`: message explicite + action suivante
- `error`: message clair + retry si pertinent
- `success`: feedback visible et comprensible

## 5. Checklist responsive transverse

- grille fluide sur les pages liste/detail
- composants media (images/cards) en ratio stable
- formulaires en colonnes adaptatives selon breakpoint
- tables volumineuses: mode compact ou scroll horizontal encadre
- actions critiques accessibles en bas d'ecran mobile

## 6. Evidence de validation attendue (Sprint 1+)

Pour chaque ecran prioritaire:

- capture mobile (`~390px`) + desktop (`>=1280px`)
- statut checklist: `OK`, `PARTIAL`, `BLOCKED`
- anomalies documentees avec severite (`S1`, `S2`, `S3`)

## 7. Hors scope de `F07.1`

- correction effective du CSS et des composants
- audit automatise complet (axe/lighthouse CI)
- certification accessibilite formelle

## 8. Sortie attendue

`F07.1` est valide quand:

- les ecrans MVP prioritaires sont identifies
- les controles responsive et a11y sont explicitement listes
- la base de recette pour `F07.2` et `F07.3` est exploitable
