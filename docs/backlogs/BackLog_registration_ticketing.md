# BackLog Registration & Ticketing

Ce backlog couvre les inscriptions, la capacite, la liste d'attente, la
promotion automatique, la billetterie et l'export des inscrits.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P1/P2`

## Taches

### R01 - Implementer la creation d'inscription et la verification de capacite

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - endpoint de soumission d'inscription
  - verification capacite et eligibilite
  - retour `CONFIRMED` ou `WAITLISTED`

### R02 - Garantir l'absence de doublons et le controle de concurrence

- Status: `TODO`
- Priority: `P0` · Difficulty: `L` · Impact: `H`
- Livrables:
  - unicite participant/evenement
  - garde-fous sur inscriptions simultanees
  - promotion waitlist atomique

### R03 - Gerer annulation et promotion automatique depuis la waitlist

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - annulation participant/organisateur
  - promotion du premier candidat eligible
  - emission `registration.promoted`

### R04 - Generer le billet electronique et le QR code

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `H`
- Livrables:
  - PDF/PNG billet
  - reference unique
  - QR code facultatif

### R05 - Exposer l'historique de participations et le telechargement billet

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - dashboard participant
  - liste des participations
  - acces au billet si confirme

### R06 - Exporter les inscrits pour les organisateurs

- Status: `TODO`
- Priority: `P2` · Difficulty: `S` · Impact: `M`
- Livrables:
  - export CSV/XLSX ou equivalent
  - colonnes statut, contact, reference billet
