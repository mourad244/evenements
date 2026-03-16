# Workflow monitoring - Ops runbooks (Sprint 5)

Ce document livre les runbooks operations pour les incidents critiques
(ticket `M05.3`).

## 1. Objectif

- Fournir des procedures pas a pas utilisables par l'equipe en incident.
- Standardiser l'escalade et la trace des actions de remediation.
- Completer la matrice `M05.1` avec un niveau operatoire executable.

## 2. Scope et dependances

- Scope:
  incidents critiques monitoring/ops du MVP et lot paiement.
- Dependances:
  `M05.1` (matrice alertes/runbooks), `M05.2` (regles d'alerte).

## 3. Format runbook impose

Chaque runbook suit la structure:

1. Trigger et severite.
2. Symptomes et impact.
3. Checks immediats (`<= 5 min`).
4. Mitigation rapide (`<= 15 min`).
5. Escalade et ownership.
6. Validation retour a la normale.
7. Post-incident (audit + actions preventives).

Journal obligatoire par incident:

- `incidentId`
- `runbookId`
- `startedAt`, `resolvedAt`
- `actorId`
- `correlationId`
- actions executees
- resultat final

## 4. Runbooks detail

### RB-N01 - Notification failures spike (`INC-N01`)

- Trigger:
  `notification_send_fail_rate_5m > 5%` sur `10 min` (`P1`).
- Impact:
  confirmations/rappels non delivres.

Checks immediats:

1. Verifier dashboards notification et volume erreur par canal.
2. Confirmer scope:
   `email` uniquement ou multi-canal.
3. Verifier erreurs dominantes (`SMTP_TIMEOUT`, `TEMPLATE_ERROR`, etc.).

Mitigation:

1. Activer retry progressif si desactive.
2. Basculer sur fallback template si erreur de rendu.
3. Limiter le debit sortant si provider throttle.

Escalade:

1. `L2 Notification` si > `20 min`.
2. `L3` si incident transverse gateway/provider.

Validation:

1. Taux echec < `2%` sur `15 min`.
2. Queue de notifications en diminution continue.

Post-incident:

1. Audit `MONITORING_RUNBOOK_RESOLVED`.
2. Enregistrer erreurs dominantes + action preventive.

### RB-T01 - Ticket generation failures (`INC-T01`)

- Trigger:
  `ticket_generation_error_rate_5m > 3%` sur `10 min` (`P1`).
- Impact:
  participants confirmes sans billet exploitable.

Checks immediats:

1. Verifier taux erreur et service ticketing.
2. Verifier stockage media (latence, erreurs ecriture).
3. Verifier erreurs de rendu (template/font/assets).

Mitigation:

1. Relancer generation idempotente sur lot en echec.
2. Appliquer fallback rendu minimal PDF.
3. Suspendre generation non critique si pression infra.

Escalade:

1. `L2 Ticketing` immediat.
2. `L3 Infra` si stockage media degrade.

Validation:

1. Erreur < `1%` sur `15 min`.
2. Lot backlog regenere avec succes.

Post-incident:

1. Tracer IDs des billets relances.
2. Ouvrir action preventive sur cause racine.

### RB-R01 - Capacity inconsistency (`INC-R01`)

- Trigger:
  `registration_capacity_conflict_total >= 1` sur `5 min` (`P1`).
- Impact:
  incoherence `CONFIRMED` vs capacite disponible.

Checks immediats:

1. Identifier event(s) affecte(s).
2. Comparer capacite cible vs inscriptions confirmees.
3. Verifier promotions waitlist recentes.

Mitigation:

1. Geler temporairement nouvelles inscriptions sur event impacte.
2. Recalculer slots via source de verite `registration-service`.
3. Corriger etats incoherents selon regles metier.

Escalade:

1. `L2 Registration` immediat.
2. `L3` si impact multi-evenements.

Validation:

1. Aucun nouveau conflit sur `15 min`.
2. Capacite et statuts alignes.

Post-incident:

1. Journaliser correction manuelle (audit).
2. Ajouter guard metrique/regle si trou de controle identifie.

### RB-P01 - Invalid payment webhook signatures (`INC-P01`)

- Trigger:
  `payment_webhook_invalid_signature_total > 20` sur `15 min` (`P2`).
- Impact:
  callbacks paiement rejetes, risque fraude/abus.

Checks immediats:

1. Verifier rotation de secret et fenetre timestamp.
2. Verifier provenance IP/certificat provider.
3. Identifier pattern par provider et type evenement.

Mitigation:

1. Isoler source suspecte (rate-limit/ip block temporaire).
2. Confirmer secret actif `current/previous`.
3. Relancer verification manuelle sur callbacks legitimes recus.

Escalade:

1. `L2 Payment` + `L2 Security`.
2. `L3` securite si suspicion attaque active.

Validation:

1. Retour a baseline signatures invalides.
2. Aucun callback legitime perdu apres correction.

Post-incident:

1. Audit securite incident.
2. Mise a jour politique rotation secret si necessaire.

### RB-P02 - Reconciliation backlog growth (`INC-P02`)

- Trigger:
  `payment_reconciliation_cases_open_total > 30` sur `30 min` (`P2`).
- Impact:
  transactions en attente prolongee, risque support client.

Checks immediats:

1. Segmenter backlog (`timeout`, `late callback`, `hard failure`).
2. Evaluer impact participant (`PENDING_PAYMENT`, event proche date).
3. Prioriser cas a risque business eleve.

Mitigation:

1. Executer reprise par lot via outil `P04.2`.
2. Cloturer cas irrecoverables avec note explicite.
3. Ajuster cadence retries automatiques si saturation.

Escalade:

1. `L2 Payment` si backlog ne baisse pas apres `30 min`.
2. `L3` provider relation si incident externe confirme.

Validation:

1. Backlog sous seuil d'alerte.
2. Diminution continue des cas `NEEDS_REVIEW`.

Post-incident:

1. Enregistrer temps moyen de resolution.
2. Ouvrir action preventive sur categorie dominante.

### RB-G01 - Gateway 5xx degradation (`INC-G01`)

- Trigger:
  `gateway_http_5xx_rate_5m > 2%` sur `10 min` (`P1`).
- Impact:
  indisponibilite partielle cross-services.

Checks immediats:

1. Identifier routes les plus en erreur.
2. Isoler service aval principal en defaillance.
3. Verifier deploy/release recents.

Mitigation:

1. Activer circuit-breaker/rate-limit ciblé.
2. Rollback derniere release si corrige l'incident.
3. Rediriger trafic si option de bascule disponible.

Escalade:

1. `L2 Gateway` immediat.
2. `L3` owner service aval + infra si panne persistante.

Validation:

1. Taux 5xx sous seuil sur `15 min`.
2. Latence retour en plage normale.

Post-incident:

1. Timeline incident completee.
2. Action preventive sur regression de release ou capacity planning.

## 5. Mode operatoire incident

Workflow standard:

1. Recevoir alerte + ouvrir ticket incident.
2. Assigner owner runbook (`L1`).
3. Executer checks immediats.
4. Appliquer mitigation.
5. Escalader si critere depasse.
6. Valider retour a normal.
7. Cloturer avec post-mortem court.

## 6. Criteres d'acceptation

- chaque incident critique dispose d'une procedure pas a pas lisible.
- l'escalade et les criteres de sortie sont explicites.
- les actions sont suffisamment precises pour execution sans ambiguite.
