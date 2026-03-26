export const projectStatus = [
  {
    label: "Sprint 0",
    value: "Baseline documentaire prete",
    detail: "Architecture, contrats REST, evenements async et diagrammes livres."
  },
  {
    label: "Sprint 1",
    value: "Socle backend en cours",
    detail: "Auth, gateway, CRUD drafts et ACL critiques deja verifies."
  },
  {
    label: "Portail docs",
    value: "V1 locale",
    detail: "Navigation graphique, recherche locale et hubs visuels sur toute la doc."
  }
];

export const quickLinks = [
  {
    title: "Perimetre MVP",
    description: "Vue produit P1 a P4 et frontieres de services.",
    to: "/reference/mvp-scope"
  },
  {
    title: "Catalogue API",
    description: "Routes Gateway, ACL, payloads et erreurs principales.",
    to: "/api"
  },
  {
    title: "Architecture globale",
    description: "Diagrammes et lecture des frontieres sync/async.",
    to: "/architecture"
  },
  {
    title: "Backlogs",
    description: "Domaines, owners, priorites et branches suggerees.",
    to: "/backlogs"
  },
  {
    title: "Sprints",
    description: "Chronologie et execution du delivery.",
    to: "/sprints"
  },
  {
    title: "Specs services",
    description: "Identity, Event, Catalog et Registration.",
    to: "/services"
  }
];

export const domainCards = [
  {
    title: "Identity",
    description: "Comptes, login, refresh, reset password, JWT et ACL minimales.",
    phase: "P1",
    status: "DONE",
    tags: ["auth", "jwt", "gateway"],
    to: "/reference/backlogs/identity-access"
  },
  {
    title: "Event",
    description: "Drafts, publication, lifecycle evenement et ownership organisateur.",
    phase: "P1",
    status: "DONE",
    tags: ["drafts", "publish", "catalog"],
    to: "/reference/backlogs/event-management"
  },
  {
    title: "Registration",
    description: "Inscription, waitlist, annulation, historique participant et ticketing futur.",
    phase: "P1-P2",
    status: "TODO",
    tags: ["waitlist", "participant", "capacity"],
    to: "/reference/backlogs/registration-ticketing"
  },
  {
    title: "Notification",
    description: "Emails et orchestrations asynchrones prevues pour le lot P2.",
    phase: "P2",
    status: "TODO",
    tags: ["email", "async", "templates"],
    to: "/reference/backlogs/notification"
  },
  {
    title: "Admin",
    description: "Moderation, audit, dashboards et supervision metier.",
    phase: "P3",
    status: "TODO",
    tags: ["moderation", "audit", "ops"],
    to: "/reference/backlogs/admin-moderation"
  },
  {
    title: "Payment",
    description: "Monetisation et webhooks pour les evenements payants.",
    phase: "P4",
    status: "TODO",
    tags: ["stripe", "transactions", "webhooks"],
    to: "/reference/backlogs/payment"
  },
  {
    title: "Frontend",
    description: "Portail public, participant, back-office organisateur et console admin.",
    phase: "P1-P3",
    status: "DONE",
    tags: ["portal", "ux", "acl"],
    to: "/reference/backlogs/frontend"
  },
  {
    title: "Monitoring",
    description: "Health checks, correlation-id, logs, observabilite et readiness.",
    phase: "P1-P5",
    status: "PARTIAL",
    tags: ["health", "logging", "tracing"],
    to: "/reference/backlogs/monitoring"
  },
  {
    title: "Documentation",
    description: "Gouvernance de la doc, diagrammes, matrices et plans de test.",
    phase: "P0-P1",
    status: "IN_PROGRESS",
    tags: ["docs", "diagrams", "governance"],
    to: "/reference/backlogs/documentation"
  }
];

export const architectureDiagrams = [
  {
    title: "Architecture globale",
    description: "Vue systeme des acteurs, services P1-P4, flux synchrones et bus d'evenements.",
    to: "/reference/diagrams/architecture-global",
    mermaid: `flowchart LR
  participant[Participant]
  organizer[Organisateur]
  admin[Administrateur]

  gateway[API Gateway]

  identity[Identity & Access]
  profile[User Profile]
  eventMgmt[Event Management]
  catalog[Catalog & Search]
  registration[Registration]
  ticketing[Ticketing]
  notification[Notification]
  adminSvc[Admin & Moderation]
  media[Media]
  payment[Payment]

  bus[(Message Bus)]
  objectStore[(Object Storage)]
  observability[(Logs / Metrics / Traces)]

  participant --> gateway
  organizer --> gateway
  admin --> gateway

  gateway --> identity
  gateway --> profile
  gateway --> eventMgmt
  gateway --> catalog
  gateway --> registration
  gateway --> ticketing
  gateway --> notification
  gateway --> adminSvc
  gateway --> media
  gateway --> payment

  registration --> eventMgmt
  profile --> registration
  eventMgmt --> media
  ticketing --> media
  payment --> registration
  payment --> ticketing

  eventMgmt -. event.published .-> bus
  eventMgmt -. event.cancelled .-> bus
  registration -. registration.confirmed .-> bus
  registration -. registration.waitlisted .-> bus
  registration -. registration.promoted .-> bus
  ticketing -. ticket.generated .-> bus
  notification -. notification.email.sent .-> bus
  payment -. payment.completed .-> bus
  identity -. audit.action.recorded .-> bus
  eventMgmt -. audit.action.recorded .-> bus
  registration -. audit.action.recorded .-> bus

  bus -.-> catalog
  bus -.-> registration
  bus -.-> ticketing
  bus -.-> notification
  bus -.-> adminSvc
  bus -.-> profile

  identity -.-> observability
  eventMgmt -.-> observability
  catalog -.-> observability
  registration -.-> observability
  ticketing -.-> observability
  notification -.-> observability
  adminSvc -.-> observability
  payment -.-> observability
  gateway -.-> observability`
  },
  {
    title: "Publication evenement",
    description: "Flux organisateur -> event management -> catalog -> notifications futures.",
    to: "/reference/diagrams/event-publication-flow",
    mermaid: `sequenceDiagram
  actor Organizer as Organisateur
  participant Gateway as API Gateway
  participant EventSvc as Event Management
  participant Bus as Message Bus
  participant Catalog as Catalog & Search
  participant Notification as Notification

  Organizer->>Gateway: POST /api/events/drafts/{id}/publish
  Gateway->>EventSvc: x-user-id / x-user-role / x-correlation-id
  EventSvc->>EventSvc: Valider ownership + draft complet
  EventSvc-->>Gateway: 200 PUBLISHED
  Gateway-->>Organizer: Confirmation publication
  EventSvc-->>Bus: event.published
  Bus-->>Catalog: Mettre a jour read model public
  Bus-->>Notification: Futur hook emails`
  },
  {
    title: "Registration waitlist",
    description: "Reservation, attente et promotion automatique apres annulation.",
    to: "/reference/diagrams/registration-waitlist-flow",
    mermaid: `sequenceDiagram
  actor Participant
  participant Gateway as API Gateway
  participant Registration as Registration Service
  participant EventSvc as Event Management
  participant Bus as Message Bus
  participant Ticketing as Ticketing
  participant Notification as Notification

  Participant->>Gateway: POST /api/registrations
  Gateway->>Registration: contexte auth + eventId
  Registration->>EventSvc: Lire policy d'inscription
  alt Capacite disponible
    Registration->>Registration: creer CONFIRMED
    Registration-->>Bus: registration.confirmed
    Bus-->>Ticketing: futur ticket
  else Evenement plein
    Registration->>Registration: creer WAITLISTED
    Registration-->>Bus: registration.waitlisted
  end
  Participant->>Gateway: POST /api/registrations/{id}/cancel
  Gateway->>Registration: annuler inscription
  Registration->>Registration: liberer place + promouvoir si possible
  Registration-->>Bus: registration.promoted`
  }
];

export const apiCollections = [
  {
    title: "Identity & Access",
    description: "Endpoints publics et proteges pour le cycle auth MVP.",
    routes: [
      { method: "POST", route: "/api/auth/register", auth: "Public", actor: "Public", usage: "Creer un compte" },
      { method: "POST", route: "/api/auth/login", auth: "Public", actor: "Public", usage: "Ouvrir une session" },
      { method: "POST", route: "/api/auth/refresh", auth: "Public", actor: "Public", usage: "Renouveler les tokens" },
      { method: "POST", route: "/api/auth/forgot-password", auth: "Public", actor: "Public", usage: "Demander un reset" },
      { method: "POST", route: "/api/auth/reset-password", auth: "Public", actor: "Public", usage: "Confirmer le reset" },
      { method: "GET", route: "/api/auth/me", auth: "Bearer", actor: "Participant / Organizer / Admin", usage: "Lire le profil connecte" }
    ]
  },
  {
    title: "Event Management",
    description: "Routes organisateur pour drafts, publication et vue Mes evenements.",
    routes: [
      { method: "POST", route: "/api/events/drafts", auth: "Bearer", actor: "Organizer / Admin", usage: "Creer un brouillon" },
      { method: "GET", route: "/api/events/drafts", auth: "Bearer", actor: "Organizer / Admin", usage: "Lister les drafts" },
      { method: "GET", route: "/api/events/drafts/{eventId}", auth: "Bearer", actor: "Organizer / Admin", usage: "Lire un draft" },
      { method: "PATCH", route: "/api/events/drafts/{eventId}", auth: "Bearer", actor: "Organizer / Admin", usage: "Modifier un draft" },
      { method: "DELETE", route: "/api/events/drafts/{eventId}", auth: "Bearer", actor: "Organizer / Admin", usage: "Supprimer un draft" },
      { method: "POST", route: "/api/events/drafts/{eventId}/publish", auth: "Bearer", actor: "Organizer / Admin", usage: "Publier immediatement" },
      { method: "POST", route: "/api/events/{eventId}/cancel", auth: "Bearer", actor: "Organizer / Admin", usage: "Annuler un evenement" },
      { method: "GET", route: "/api/events/me", auth: "Bearer", actor: "Organizer / Admin", usage: "Vue Mes evenements" }
    ]
  },
  {
    title: "Registration & Profile",
    description: "Parcours participant pour inscriptions, historique et waitlist.",
    routes: [
      { method: "POST", route: "/api/registrations", auth: "Bearer", actor: "Participant", usage: "Creer une inscription" },
      { method: "POST", route: "/api/registrations/{registrationId}/cancel", auth: "Bearer", actor: "Participant", usage: "Annuler une inscription" },
      { method: "GET", route: "/api/profile/participations", auth: "Bearer", actor: "Participant", usage: "Lire l'historique participant" }
    ]
  }
];

export const backlogDocs = [
  { title: "Identity & Access", description: "Backlog auth, sessions, roles et security.", to: "/reference/backlogs/identity-access", owner: "Mourad", priority: "P0", status: "DONE" },
  { title: "Event Management", description: "Backlog drafts, publication et catalogue.", to: "/reference/backlogs/event-management", owner: "Mourad", priority: "P0", status: "DONE" },
  { title: "Registration & Ticketing", description: "Backlog inscriptions, waitlist et billets.", to: "/reference/backlogs/registration-ticketing", owner: "Mourad", priority: "P0", status: "TODO" },
  { title: "Notification", description: "Emails, retries, templates et delivery logs.", to: "/reference/backlogs/notification", owner: "Mourad", priority: "P1", status: "TODO" },
  { title: "Admin & Moderation", description: "Moderation, audit, recherche globale et KPIs.", to: "/reference/backlogs/admin-moderation", owner: "Ibrahim", priority: "P1", status: "TODO" },
  { title: "Payment", description: "Paiement, transactions et webhooks provider.", to: "/reference/backlogs/payment", owner: "Mourad", priority: "P2", status: "TODO" },
  { title: "Frontend", description: "UX portal, shells, pages et integration front/back.", to: "/reference/backlogs/frontend", owner: "Ibrahim", priority: "P0", status: "DONE" },
  { title: "Monitoring", description: "Operabilite, logs, correlation-id, readiness.", to: "/reference/backlogs/monitoring", owner: "Mourad", priority: "P1", status: "PARTIAL" },
  { title: "Documentation", description: "Diagrammes, matrices, conventions et gouvernance.", to: "/reference/backlogs/documentation", owner: "Mourad", priority: "P1", status: "IN_PROGRESS" }
];

export const sprintDocs = [
  { title: "Sprint 0", description: "Fondations architecture et contrats.", to: "/reference/sprints/sprint-0-architecture-foundation", phase: "P0", status: "DONE" },
  { title: "Sprint 1", description: "MVP publication et inscription.", to: "/reference/sprints/sprint-1-mvp", phase: "P1", status: "IN_PROGRESS" },
  { title: "Sprint 1 Tracker", description: "Execution tracker machine + humain.", to: "/reference/sprints/sprint-1-tracker", phase: "P1", status: "IN_PROGRESS" },
  { title: "Sprint 2", description: "Ticketing et notifications.", to: "/reference/sprints/sprint-2-ticketing-notifications", phase: "P2", status: "TODO" },
  { title: "Sprint 3", description: "Administration et moderation.", to: "/reference/sprints/sprint-3-admin-moderation", phase: "P3", status: "TODO" },
  { title: "Sprint 4", description: "Paiement et extensions.", to: "/reference/sprints/sprint-4-payment-extensions", phase: "P4", status: "TODO" }
];

export const serviceDocs = [
  { title: "Identity Access Service", description: "Users, sessions, reset password et JWT.", to: "/reference/services/identity-access-service", status: "DONE", phase: "P1" },
  { title: "Event Management Service", description: "Drafts, publish, lifecycle evenement et hooks async.", to: "/reference/services/event-management-service", status: "DONE", phase: "P1" },
  { title: "Catalog Search Service", description: "Read model public et filtres de recherche.", to: "/reference/services/catalog-search-service", status: "DONE", phase: "P1" },
  { title: "Registration Service", description: "Capacity, waitlist, annulations et promotions.", to: "/reference/services/registration-service", status: "DONE", phase: "P1" }
];

export const workflowDocs = [
  { title: "Workflow backend", description: "Conventions backend transverses.", to: "/reference/workflows/backend", owner: "Mourad" },
  { title: "Workflow backend domaine evenement", description: "Decoupage de delivery pour l'event domain.", to: "/reference/workflows/backend-event-domain", owner: "Mourad" },
  { title: "Workflow frontend", description: "Conventions shells, ACL et etats UI.", to: "/reference/workflows/frontend", owner: "Ibrahim" },
  { title: "Workflow frontend portal evenement", description: "Parcours portail public et surfaces majeures.", to: "/reference/workflows/frontend-event-portal", owner: "Ibrahim" }
];

export const ideasDocs = [
  { title: "Idees produit et techniques", description: "Parking lot pour futures idees a recycler dans les backlogs.", to: "/reference/ideas/ideas", status: "TODO" }
];
