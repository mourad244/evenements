---
title: Event moderation hooks
description: Contract des cas de publication soumise a moderation et de demande de correction pour le domaine evenement.
docKind: contract
domain: event-management
phase: P3
owner: Mourad
status: DONE
priority: P2
tags:
  - moderation
  - events
  - admin
slug: event-moderation-hooks
---

# Event moderation hooks

Ce document stabilise le comportement attendu quand la publication d'un
evenement doit passer par une validation admin.

## 1. Objectif

- Decrire quand un brouillon passe en revue admin avant publication.
- Stabiliser le comportement de retour vers l'organisateur quand des
  corrections sont demandees.
- Aligner `event-management-service` avec le contrat de moderation
  admin deja documente.

## 2. Perimetre

- La moderation ne cree pas de nouvelle route publique dans
  `event-management-service`.
- Le cas principal reste le brouillon organisateur.
- Le service admin de moderation reste proprietaire de la file de
  moderation et des decisions `approve`, `reject`, `request_changes`,
  `suspend` et `reopen`.

## 3. Cas documentes

### 3.1 Publication soumise a moderation

Quand la politique produit exige un passage admin:

- l'organisateur demande la publication;
- `event-management-service` conserve l'evenement en `DRAFT`;
- une fiche de moderation est creee cote `admin-moderation-service`;
- la reponse expose une attente explicite de revue admin.

Reponse cible de la publication:

```json
{
  "success": true,
  "data": {
    "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
    "status": "DRAFT",
    "moderationStatus": "PENDING",
    "moderationCaseId": "c7f6a12b-4f3a-4b4e-9b9f-9d9d7a5f3e19",
    "nextAction": "WAIT_FOR_ADMIN_REVIEW"
  }
}
```

Effets attendus:

- aucune diffusion publique tant que la moderation n'est pas approuvee;
- aucune emission `event.published` tant que la decision finale n'est
  pas `approve`;
- le brouillon reste editable par l'organisateur.

### 3.2 Demande de correction

Quand l'admin demande des corrections:

- la moderation passe en `CHANGES_REQUESTED`;
- l'evenement reste en `DRAFT`;
- l'organisateur reprend le brouillon, corrige le contenu, puis repasse
  par le flux de publication.

Effets attendus:

- aucun effet catalogue;
- aucune publication publique;
- la demande de correction reste visible dans la file admin et dans
  les traces de moderation.

## 4. Decisions admin et effets metier

| Action admin | Etat moderation | Effet sur l'evenement |
| --- | --- | --- |
| `approve` | `APPROVED` | publication effective et emission de `event.published` |
| `request_changes` | `CHANGES_REQUESTED` | retour en edition, evenement reste `DRAFT` |
| `reject` | `REJECTED` | publication refusee, evenement reste `DRAFT` |
| `suspend` | `SUSPENDED` | reserve pour les evenements deja visibles, hors tranche d'implementation actuelle |
| `reopen` | `PENDING` | remise en file de moderation |

## 5. Evenements attendus

Le domaine evenement consomme les evenements de moderation suivants:

- `moderation.case_approved`
- `moderation.case_changes_requested`
- `moderation.case_rejected`

Effets attendus cote event-management:

- `moderation.case_approved` publie l'evenement puis emet
  `event.published`;
- `moderation.case_changes_requested` maintient le brouillon et
  conserve le besoin de correction;
- `moderation.case_rejected` conserve l'evenement en brouillon sans
  exposition publique.

Les messages restent idempotents par `messageId` et doivent propager le
`correlationId`.

## 6. Contraintes de gouvernance

- Pas de moderation implicite sans contrat documente.
- Pas de changement public de statut tant que la moderation n'est pas
  resolue.
- Pas de suppression physique du brouillon pour simuler une rejection.

## 7. Liens

- Contrat admin: [`docs/workflows/Workflow_admin_moderation_contract.md`](/home/mourad/git_workspace_work/evenements/docs/workflows/Workflow_admin_moderation_contract.md)
- Spec admin: [`docs/services/admin-moderation-service-spec.md`](/home/mourad/git_workspace_work/evenements/docs/services/admin-moderation-service-spec.md)
- Spec event: [`docs/services/event-management-service-spec.md`](/home/mourad/git_workspace_work/evenements/docs/services/event-management-service-spec.md)
