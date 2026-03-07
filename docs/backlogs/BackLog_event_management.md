# BackLog Event Management

Ce backlog couvre la creation, l'edition, la publication et le cycle de
vie des evenements par les organisateurs.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P1`

## Taches

### E01 - Definir le modele evenement

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - entite `Event`
  - statuts `DRAFT/PUBLISHED/FULL/CLOSED/ARCHIVED/CANCELLED`
  - themes, lieu, visibilite, tarification, capacite, consignes

### E02 - Creer le CRUD organisateur sur brouillons

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - create/update/delete draft
  - validation des champs obligatoires
  - gestion des dates et capacites

### E03 - Gerer publication immediate et differee

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - transition `DRAFT -> PUBLISHED`
  - planification de publication
  - emission d'un evenement `event.published`

### E04 - Isoler la gestion media evenement

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - upload image/asset
  - validation type/poids
  - URL ou reference d'acces pour le catalogue

### E05 - Outiller la vue "Mes evenements" organisateur

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - listing des evenements
  - filtres par statut/date/theme
  - compteurs brouillons/publies/complets

### E06 - Integrer les hooks de moderation et d'annulation

- Status: `TODO`
- Priority: `P2` · Difficulty: `M` · Impact: `M`
- Livrables:
  - evenement soumis a validation admin si besoin
  - annulation propre avec impact catalogue/inscriptions/notifications
