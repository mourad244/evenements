# BackLog Payment

Ce backlog couvre le lot optionnel de monetisation pour les evenements
payants.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P4`

## Taches

### P01 - Fixer le perimetre paiement du projet

- Status: `TODO`
- Priority: `P0` · Difficulty: `S` · Impact: `H`
- Livrables:
  - choix du provider ou abstraction maison
  - flux accepte: paiement simple, remboursement, annulation

### P02 - Definir le contrat checkout / webhook

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - creation session de paiement
  - callback / webhook
  - verification signature provider

### P03 - Aligner inscription, paiement et billet

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - statuts coherents entre registration et payment
  - regles d'emission de billet selon paiement

### P04 - Gerer les erreurs et la reconciliation

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `H`
- Livrables:
  - transactions `PENDING/PAID/FAILED/REFUNDED`
  - reprise manuelle et journalisation

### P05 - Vue organisateur sur les encaissements

- Status: `TODO`
- Priority: `P2` · Difficulty: `S` · Impact: `M`
- Livrables:
  - liste des paiements par evenement
  - filtres et export
