# Service map - Event platform microservices

## Service map

| Service | Main responsibilities | Core entities | Main exchange mode | Target phase |
| --- | --- | --- | --- | --- |
| API Gateway | Entry point, routing, auth propagation, rate limiting | n/a | REST facade | P1 |
| Identity & Access | Accounts, login, sessions, roles, password reset | User, Role, Session | REST | P1 |
| User Profile | Preferences, participation history, personal dashboard data | Profile, Preference, ParticipationView | REST | P1 |
| Event Management | Drafts, publication, lifecycle, organizer ownership | Event, Theme, Venue, EventPolicy | REST + events | P1 |
| Catalog & Search | Public listing, filters, calendar, search index | CatalogView, SearchIndex | REST + events | P1 |
| Registration | Capacity, eligibility, waitlist, cancellations, promotions | Registration, WaitlistEntry | REST + events | P1 |
| Ticketing | Ticket issuance, QR code, file artifact generation | Ticket, TicketArtifact | Async + REST read | P2 |
| Notification | Email/SMS orchestration, retries, delivery logs | NotificationLog, Template | Async | P2 |
| Admin & Moderation | Moderation, audit, dashboards, cross-search | ModerationCase, AuditEntry, KPIView | REST + events | P3 |
| Media | Event images and ticket files storage | MediaAsset | REST | P1/P2 |
| Payment | Paid events, transaction states, provider callbacks | PaymentTransaction | REST + webhooks + events | P4 |

## State ownership

- Event status is owned by `Event Management`.
- Registration status is owned by `Registration`.
- Ticket state is owned by `Ticketing`.
- Notification state is owned by `Notification`.
- Payment state is owned by `Payment`.
- Audit remains cross-cutting, but the action source still belongs to the
  originating service.

## Async events

Recommended domain events:

- `event.published`
- `event.cancelled`
- `registration.confirmed`
- `registration.waitlisted`
- `registration.promoted`
- `ticket.generated`
- `notification.email.requested`
- `notification.email.sent`
- `payment.completed`
- `audit.action.recorded`

## Common ownership traps

- Do not let `Catalog & Search` become the owner of event editing rules.
- Do not let `Ticketing` decide whether an inscription is confirmed.
- Do not let `Notification` be called synchronously for every action unless
  the UX strictly requires immediate feedback.
- Do not couple `Payment` to organizer CRUD screens before the paid-event
  scope is confirmed.
