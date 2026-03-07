# BackLog Admin & Moderation

Ce backlog couvre la console d'administration, la moderation des
evenements, l'audit et les indicateurs de pilotage.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P3`

## Taches

### A01 - Construire le shell de console admin

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - navigation admin
  - guards de role `ADMIN`
  - dashboard vide structure

### A02 - Mettre en place la file de moderation evenement

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - liste evenements a valider / signales
  - action `approve/reject/request-changes`
  - motif et audit associes

### A03 - Exposer l'audit des actions sensibles

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - recherche par acteur, action, cible, date
  - logs publication, annulation, moderation, notification

### A04 - Recherche multicriteres utilisateurs et evenements

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - recherche texte + filtres
  - navigation vers fiche cible

### A05 - Definir les KPI de pilotage

- Status: `TODO`
- Priority: `P1` · Difficulty: `S` · Impact: `M`
- Livrables:
  - evenements publies
  - taux de remplissage
  - attente / promotions
  - notifications en echec

### A06 - Vue incident bout en bout

- Status: `TODO`
- Priority: `P2` · Difficulty: `M` · Impact: `M`
- Livrables:
  - correlation-id
  - chronologie inter-services
  - support a l'investigation
