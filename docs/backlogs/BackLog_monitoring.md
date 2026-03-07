# BackLog Monitoring & Exploitation

Ce backlog couvre l'observabilite, les health checks, les traces, les
alertes et les mecanismes de reprise sur incident.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P3/P5`

## Taches

### M01 - Standardiser health checks et readiness probes

- Status: `TODO`
- Priority: `P0` · Difficulty: `S` · Impact: `H`
- Livrables:
  - `/health` et `/ready` par service
  - dependances critiques visibles

### M02 - Poser correlation-id et logs structures

- Status: `TODO`
- Priority: `P0` · Difficulty: `S` · Impact: `H`
- Livrables:
  - propagation gateway -> services
  - format de log partage

### M03 - Exposer les metriques techniques et metier

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `H`
- Livrables:
  - taux inscription confirmee / waitlist
  - delais ticketing / notification
  - erreurs par service

### M04 - Ajouter traces distribuees sur les flux critiques

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - publication evenement
  - inscription -> ticket -> notification

### M05 - Definir alertes et runbooks

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `M`
- Livrables:
  - alertes erreurs notification
  - alertes generation billet
  - runbook incident de capacite

### M06 - Tester backup et restauration

- Status: `TODO`
- Priority: `P2` · Difficulty: `M` · Impact: `H`
- Livrables:
  - procedure de sauvegarde
  - test de restauration
  - trace d'execution
