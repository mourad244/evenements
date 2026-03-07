# BackLog Identity & Access

Ce backlog couvre le futur service d'authentification, autorisation,
roles, sessions et securite d'acces.

## Meta

- Statut global: `TODO`
- Date debut: `2026-03-07`
- Priorite produit: `P1`

## Taches

### I01 - Specifier le modele utilisateur, role et session

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - modele `User`, `Role`, `Session`, `PasswordResetToken`
  - regles d'activation/desactivation
  - matrice de roles `PARTICIPANT/ORGANIZER/ADMIN`

### I02 - Implementer inscription, login, refresh et reset mot de passe

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - endpoints `register`, `login`, `refresh`, `forgot-password`, `reset-password`
  - reponses d'erreur homogenes
  - protection anti brute force

### I03 - Definir le contrat JWT / session et les middlewares Gateway

- Status: `TODO`
- Priority: `P0` · Difficulty: `M` · Impact: `H`
- Livrables:
  - format des claims
  - validation via Gateway
  - propagation du contexte utilisateur aux services

### I04 - Poser l'autorisation fine par ressource

- Status: `TODO`
- Priority: `P1` · Difficulty: `M` · Impact: `H`
- Livrables:
  - regles `own-resource` vs `admin-resource`
  - controle acces organisateur sur ses propres evenements
  - matrice des actions admin

### I05 - Journaliser les evenements de securite

- Status: `TODO`
- Priority: `P1` · Difficulty: `S` · Impact: `H`
- Livrables:
  - audit des logins, echecs, resets, lockouts
  - correlation-id et metadata minimales

### I06 - Definir la politique de secrets et de rotation

- Status: `TODO`
- Priority: `P2` · Difficulty: `S` · Impact: `M`
- Livrables:
  - regles de rotation JWT keys / mots de passe admin
  - checklist environnement dev / preprod / prod
