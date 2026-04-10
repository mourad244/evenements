---
title: Strategie securite Evenements
description: Traduction du livrable HTML "Securite" vers les controles, references et limites reelles du depot Evenements.
docKind: catalog
domain: security
phase: P1-P4
owner: Mourad
status: DONE
tags:
  - security
  - stride
  - owasp
  - events
slug: security-strategy-evenements
---

# Strategie securite - Evenements

## Objet

Le HTML `AgendaGo` attend une documentation securite lisible par
livrable: STRIDE, OWASP, QR/HMAC, ACL et integrite du flux
d'inscription.

Le depot courant repartit deja ces sujets entre specs services, plans de
test et workflows. Ce document les regroupe pour le sujet
`Evenements`.

## Invariants a ne pas casser

- authentifier chaque acteur et propager un contexte fiable via la
  Gateway;
- verifier role et ownership avant toute mutation sensible;
- empecher la double inscription sur un meme evenement;
- traiter waitlist, annulation et promotion de facon atomique;
- garder une trace exploitable des actions critiques;
- proteger les artefacts derives comme tickets et QR codes.

## Lecture STRIDE adaptee au repo

| Menace | Scenario HTML | References canoniques du repo | Etat |
| --- | --- | --- | --- |
| Spoofing | faux compte / email jetable | [Spec identity-access-service](./services/identity-access-service-spec.md), [Catalogue REST P1](./api-contracts-p1.md) | mixte: auth/ACL documentees, verification email a confirmer selon service et lot |
| Tampering | race condition sur la derniere place | [Dictionnaire P1](./data-dictionary-p1.md), [Spec registration-service](./services/registration-service-spec.md) | couvert cote modelisation et logique registration |
| Information disclosure | un participant lit tous les inscrits | [Plan ACL](./test-plan-role-regression.md), [Catalogue REST P1](./api-contracts-p1.md) | couvert par contrats et tests ACL |
| DoS / abuse | boucles inscription/desinscription | [Perimetre MVP](./mvp_scope.md), [Matrice de recette](./test-plan-acceptance-matrix.md) | cible a maintenir explicite; ne pas supposer le rate limiting sans verification de code |
| Repudiation | un organisateur nie une annulation | [Spec admin-audit-service](./services/admin-audit-service-spec.md), [Workflow admin audit contract](./workflows/Workflow_admin_audit_contract.md) | couvert en design, a verifier service par service en runtime |
| Elevation of privilege | un participant modifie un event | [Plan ACL](./test-plan-role-regression.md), `tests/s1-t02.gateway-acl-matrix.unit.test.js`, `tests/s1-t07.auth-security-audit.smoke.test.js` | couvert |

## OWASP Top 10 - positionnement repo

| Theme OWASP | Position repo | Source principale |
| --- | --- | --- |
| Broken Access Control | matrice ACL, ownership, facade Gateway | [Plan ACL](./test-plan-role-regression.md) |
| Cryptographic Failures | JWT/tokens cote auth, QR/tickets cote lots ulterieurs | [Spec identity-access-service](./services/identity-access-service-spec.md), `tests/s2-t10.ticket-qr-code.unit.test.js` |
| Injection | validation stricte, contrats stables, repositories dedies | [Workflow backend](./workflows/Workflow_backend.md) |
| Insecure Design | waitlist atomique, contrainte d'unicite, modelisation des statuts | [Dictionnaire P1](./data-dictionary-p1.md), [Spec registration-service](./services/registration-service-spec.md) |
| Security Misconfiguration | health/ready, correlation-id, observabilite, futures politiques CI/deploy | [Workflow monitoring metric catalog](./workflows/Workflow_monitoring_metric_catalog.md) |
| Identification and Authentication Failures | register/login/refresh/reset et sessions | [Catalogue REST P1](./api-contracts-p1.md), [Spec identity-access-service](./services/identity-access-service-spec.md) |

## Ce que le HTML demande et comment le lire ici

### `SELECT FOR UPDATE`

Dans le HTML, ce mecanisme est presente comme controle critique du
projet `AgendaGo`.

Dans le repo, la reference canonique est:

- [Dictionnaire de donnees P1](./data-dictionary-p1.md)
- [Spec registration-service](./services/registration-service-spec.md)
- `services/registration-service/src/repositories/registrationRepository.js`

### QR / HMAC

Le HTML parle d'un QR signe HMAC pour la presence.

Dans le repo, cette couverture existe surtout sur le lot ticketing et
les artefacts derives:

- `tests/s2-t09.ticket-artifact-generation.unit.test.js`
- `tests/s2-t10.ticket-qr-code.unit.test.js`
- [Sprint 2 - ticketing & notifications](./sprints/sprint_2_ticketing_notifications.md)

### ACL et ownership

Le HTML attend:

- organisateur proprietaire pour modifier/annuler un evenement;
- participant limite a ses propres inscriptions;
- lecture differenciee entre roles.

Dans le repo, la reference canonique est:

- [Plan de non-regression ACL et roles](./test-plan-role-regression.md)
- `tests/s1-t02.gateway-acl-matrix.unit.test.js`
- `tests/s1-t07.auth-security-audit.smoke.test.js`

## Regle de prudence documentaire

Quand un controle apparait dans le HTML mais n'est pas encore verifie
dans le code ou dans les tests du repo, le documenter comme:

- `cible`
- `a verifier`
- ou `partiel`

Ne pas le presenter comme deja livre par simple effet de cadrage.
