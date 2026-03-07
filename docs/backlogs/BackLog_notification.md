# BackLog Notification

Ce backlog couvre les notifications email, la simulation SMS, les rappels,
les retries et la journalisation des envois.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P2`

## Taches

### N01 - Definir les templates transactionnels

- Status: `TODO`
- Priority: `P0` · Difficulty: `S` · Impact: `H`
- Livrables:
  - templates confirmation
  - attente
  - promotion
  - rappel
  - annulation

### N02 - Construire le pipeline asynchrone d'envoi

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - consommation des evenements metier
  - envoi email
  - statut technique par message

### N03 - Simuler le canal SMS en premiere version

- Status: `TODO`
- Priority: `P1` · Difficulty: `S` · Impact: `M`
- Livrables:
  - payload SMS normalise
  - mode simulation trace en logs / base

### N04 - Gerer retries, dead-letter et reprise manuelle

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `H`
- Livrables:
  - politique de retry
  - gestion des echecs permanents
  - exploitation simple cote admin

### N05 - Planifier les rappels evenement

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - scheduler des rappels
  - fenetres de rappel configurables

### N06 - Exposer les journaux d'envoi

- Status: `TODO`
- Priority: `P2` · Difficulty: `S` · Impact: `M`
- Livrables:
  - recherche des notifications par evenement ou utilisateur
  - statut `SENT/FAILED/SIMULATED`
