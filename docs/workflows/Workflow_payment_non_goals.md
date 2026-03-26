# Workflow payment - Non-goals (Sprint 4)

Ce document formalise les scenarios explicitement exclus du premier lot
paiement (ticket `P01.3`) pour eviter le scope creep.

## 1. Objectif

- Encadrer les limites du lot paiement MVP.
- Eviter les interpretations implicites pendant l'implementation.
- Reporter les sujets complexes vers des phases futures.

## 2. Non-goals fonctionnels

Les capacites suivantes ne sont pas incluses en Sprint 4 lot 1:

- multi-provider actif en production
- split payment / marketplace multi-vendeurs
- abonnements recurrents et renouvellements auto
- paiement en plusieurs fois (installments)
- coupons dynamiques complexes et rules engine pricing avance
- wallets externes custom non supportes par le provider de base

## 3. Non-goals remboursements

- remboursement partiel (montant partiel)
- remboursement multi-etapes avec arbitrage automatise
- chargeback/dispute management automatise
- compensation automatique cross-transaction

## 4. Non-goals anti-fraude et risque

- scoring fraude avance en temps reel
- orchestration multi-outils KYC/AML
- blocage comportemental base ML
- investigation fraude automatisee

## 5. Non-goals reconciliation

- moteur de reconciliation full auto de bout en bout
- correction autonome sans validation humaine
- backfill historique massif des transactions legacy
- rapprochement multi-systemes comptables externes

## 6. Non-goals UI et reporting

- console finance complete (equivalent BI)
- analytics avances revenus/funnel
- reporting fiscal localise par pays
- export comptable multi-formats norme entreprise

## 7. Non-goals compliance/ops

- certification PCI niveau avance geree en interne
- SLA contractualise 24/7 avec on-call finance dedie
- rotation cle provider automatisee sans procedure ops

## 8. Features differees (backlog futur)

Sujets a replanifier apres stabilisation lot 1:

- support multi-provider actif/actif
- refund partiel et policies fines
- module chargeback/dispute
- tableau financier avance organisateur/admin
- anti-fraude enrichie et scoring risque

## 9. Regle de gouvernance scope

Toute demande hors perimetre lot 1:

- est marquee `OUT_OF_SCOPE_P4_L1`
- requiert ticket backlog dedie avec impact analyse
- ne bloque pas la livraison des tickets `P02` -> `P05` du lot 1

## 10. Criteres d'acceptation

- scenarios exclus notes explicitement et sans ambiguite
- frontieres lot 1 partagees entre produit, backend et frontend
- base de decision claire pour arbitrer les demandes tardives
