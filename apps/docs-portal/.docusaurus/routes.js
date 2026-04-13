import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/api/',
    component: ComponentCreator('/api/', '393'),
    exact: true
  },
  {
    path: '/architecture/',
    component: ComponentCreator('/architecture/', '24f'),
    exact: true
  },
  {
    path: '/backlogs/',
    component: ComponentCreator('/backlogs/', 'f3e'),
    exact: true
  },
  {
    path: '/ideas/',
    component: ComponentCreator('/ideas/', '9ed'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/services/',
    component: ComponentCreator('/services/', '317'),
    exact: true
  },
  {
    path: '/sprints/',
    component: ComponentCreator('/sprints/', 'ef3'),
    exact: true
  },
  {
    path: '/workflows/',
    component: ComponentCreator('/workflows/', '235'),
    exact: true
  },
  {
    path: '/reference',
    component: ComponentCreator('/reference', '796'),
    routes: [
      {
        path: '/reference',
        component: ComponentCreator('/reference', '41e'),
        routes: [
          {
            path: '/reference/tags',
            component: ComponentCreator('/reference/tags', 'f5a'),
            exact: true
          },
          {
            path: '/reference/tags/acl',
            component: ComponentCreator('/reference/tags/acl', 'f98'),
            exact: true
          },
          {
            path: '/reference/tags/admin',
            component: ComponentCreator('/reference/tags/admin', '53f'),
            exact: true
          },
          {
            path: '/reference/tags/api',
            component: ComponentCreator('/reference/tags/api', 'e37'),
            exact: true
          },
          {
            path: '/reference/tags/architecture',
            component: ComponentCreator('/reference/tags/architecture', '8cc'),
            exact: true
          },
          {
            path: '/reference/tags/audit',
            component: ComponentCreator('/reference/tags/audit', '6b5'),
            exact: true
          },
          {
            path: '/reference/tags/auth',
            component: ComponentCreator('/reference/tags/auth', '154'),
            exact: true
          },
          {
            path: '/reference/tags/backend',
            component: ComponentCreator('/reference/tags/backend', '623'),
            exact: true
          },
          {
            path: '/reference/tags/catalog',
            component: ComponentCreator('/reference/tags/catalog', '4cf'),
            exact: true
          },
          {
            path: '/reference/tags/contracts',
            component: ComponentCreator('/reference/tags/contracts', '876'),
            exact: true
          },
          {
            path: '/reference/tags/conventions',
            component: ComponentCreator('/reference/tags/conventions', '536'),
            exact: true
          },
          {
            path: '/reference/tags/diagram',
            component: ComponentCreator('/reference/tags/diagram', '47d'),
            exact: true
          },
          {
            path: '/reference/tags/diagrams',
            component: ComponentCreator('/reference/tags/diagrams', 'd26'),
            exact: true
          },
          {
            path: '/reference/tags/docs',
            component: ComponentCreator('/reference/tags/docs', '969'),
            exact: true
          },
          {
            path: '/reference/tags/documentation',
            component: ComponentCreator('/reference/tags/documentation', '012'),
            exact: true
          },
          {
            path: '/reference/tags/drafts',
            component: ComponentCreator('/reference/tags/drafts', '2a1'),
            exact: true
          },
          {
            path: '/reference/tags/email',
            component: ComponentCreator('/reference/tags/email', '3cc'),
            exact: true
          },
          {
            path: '/reference/tags/events',
            component: ComponentCreator('/reference/tags/events', '804'),
            exact: true
          },
          {
            path: '/reference/tags/execution',
            component: ComponentCreator('/reference/tags/execution', 'a50'),
            exact: true
          },
          {
            path: '/reference/tags/extensions',
            component: ComponentCreator('/reference/tags/extensions', '3a0'),
            exact: true
          },
          {
            path: '/reference/tags/frontend',
            component: ComponentCreator('/reference/tags/frontend', '28a'),
            exact: true
          },
          {
            path: '/reference/tags/future',
            component: ComponentCreator('/reference/tags/future', 'db5'),
            exact: true
          },
          {
            path: '/reference/tags/gateway',
            component: ComponentCreator('/reference/tags/gateway', '7d7'),
            exact: true
          },
          {
            path: '/reference/tags/governance',
            component: ComponentCreator('/reference/tags/governance', 'c5b'),
            exact: true
          },
          {
            path: '/reference/tags/ideas',
            component: ComponentCreator('/reference/tags/ideas', 'd04'),
            exact: true
          },
          {
            path: '/reference/tags/jwt',
            component: ComponentCreator('/reference/tags/jwt', '69c'),
            exact: true
          },
          {
            path: '/reference/tags/logs',
            component: ComponentCreator('/reference/tags/logs', 'e19'),
            exact: true
          },
          {
            path: '/reference/tags/mermaid',
            component: ComponentCreator('/reference/tags/mermaid', '120'),
            exact: true
          },
          {
            path: '/reference/tags/moderation',
            component: ComponentCreator('/reference/tags/moderation', 'c4a'),
            exact: true
          },
          {
            path: '/reference/tags/monitoring',
            component: ComponentCreator('/reference/tags/monitoring', '664'),
            exact: true
          },
          {
            path: '/reference/tags/mvp',
            component: ComponentCreator('/reference/tags/mvp', '07a'),
            exact: true
          },
          {
            path: '/reference/tags/navigation',
            component: ComponentCreator('/reference/tags/navigation', '3ba'),
            exact: true
          },
          {
            path: '/reference/tags/notification',
            component: ComponentCreator('/reference/tags/notification', 'ea5'),
            exact: true
          },
          {
            path: '/reference/tags/overview',
            component: ComponentCreator('/reference/tags/overview', '3a4'),
            exact: true
          },
          {
            path: '/reference/tags/payment',
            component: ComponentCreator('/reference/tags/payment', '09e'),
            exact: true
          },
          {
            path: '/reference/tags/portal',
            component: ComponentCreator('/reference/tags/portal', '682'),
            exact: true
          },
          {
            path: '/reference/tags/product',
            component: ComponentCreator('/reference/tags/product', '532'),
            exact: true
          },
          {
            path: '/reference/tags/publish',
            component: ComponentCreator('/reference/tags/publish', '2e8'),
            exact: true
          },
          {
            path: '/reference/tags/readiness',
            component: ComponentCreator('/reference/tags/readiness', '7b7'),
            exact: true
          },
          {
            path: '/reference/tags/registration',
            component: ComponentCreator('/reference/tags/registration', 'aee'),
            exact: true
          },
          {
            path: '/reference/tags/rest',
            component: ComponentCreator('/reference/tags/rest', '19c'),
            exact: true
          },
          {
            path: '/reference/tags/retries',
            component: ComponentCreator('/reference/tags/retries', '309'),
            exact: true
          },
          {
            path: '/reference/tags/scope',
            component: ComponentCreator('/reference/tags/scope', 'dac'),
            exact: true
          },
          {
            path: '/reference/tags/search',
            component: ComponentCreator('/reference/tags/search', '7e9'),
            exact: true
          },
          {
            path: '/reference/tags/sessions',
            component: ComponentCreator('/reference/tags/sessions', '6b5'),
            exact: true
          },
          {
            path: '/reference/tags/spec',
            component: ComponentCreator('/reference/tags/spec', 'f67'),
            exact: true
          },
          {
            path: '/reference/tags/sprint-0',
            component: ComponentCreator('/reference/tags/sprint-0', 'cec'),
            exact: true
          },
          {
            path: '/reference/tags/sprint-1',
            component: ComponentCreator('/reference/tags/sprint-1', 'c0d'),
            exact: true
          },
          {
            path: '/reference/tags/sprint-2',
            component: ComponentCreator('/reference/tags/sprint-2', '458'),
            exact: true
          },
          {
            path: '/reference/tags/sprint-3',
            component: ComponentCreator('/reference/tags/sprint-3', '86c'),
            exact: true
          },
          {
            path: '/reference/tags/sprint-4',
            component: ComponentCreator('/reference/tags/sprint-4', '5b9'),
            exact: true
          },
          {
            path: '/reference/tags/ticketing',
            component: ComponentCreator('/reference/tags/ticketing', '17b'),
            exact: true
          },
          {
            path: '/reference/tags/tickets',
            component: ComponentCreator('/reference/tags/tickets', '59d'),
            exact: true
          },
          {
            path: '/reference/tags/tracker',
            component: ComponentCreator('/reference/tags/tracker', '2da'),
            exact: true
          },
          {
            path: '/reference/tags/transactions',
            component: ComponentCreator('/reference/tags/transactions', '664'),
            exact: true
          },
          {
            path: '/reference/tags/users',
            component: ComponentCreator('/reference/tags/users', 'af8'),
            exact: true
          },
          {
            path: '/reference/tags/ux',
            component: ComponentCreator('/reference/tags/ux', '517'),
            exact: true
          },
          {
            path: '/reference/tags/waitlist',
            component: ComponentCreator('/reference/tags/waitlist', 'e4c'),
            exact: true
          },
          {
            path: '/reference/tags/webhooks',
            component: ComponentCreator('/reference/tags/webhooks', '88d'),
            exact: true
          },
          {
            path: '/reference/tags/workflow',
            component: ComponentCreator('/reference/tags/workflow', '3b0'),
            exact: true
          },
          {
            path: '/reference',
            component: ComponentCreator('/reference', 'beb'),
            routes: [
              {
                path: '/reference/api-contracts-p1',
                component: ComponentCreator('/reference/api-contracts-p1', '746'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/async-events-p1',
                component: ComponentCreator('/reference/async-events-p1', '801'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/admin-moderation',
                component: ComponentCreator('/reference/backlogs/admin-moderation', 'b35'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/documentation',
                component: ComponentCreator('/reference/backlogs/documentation', 'aff'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/event-management',
                component: ComponentCreator('/reference/backlogs/event-management', '411'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/frontend',
                component: ComponentCreator('/reference/backlogs/frontend', 'f11'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/identity-access',
                component: ComponentCreator('/reference/backlogs/identity-access', '014'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/monitoring',
                component: ComponentCreator('/reference/backlogs/monitoring', '7bf'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/notification',
                component: ComponentCreator('/reference/backlogs/notification', 'd45'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/payment',
                component: ComponentCreator('/reference/backlogs/payment', 'c75'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/backlogs/registration-ticketing',
                component: ComponentCreator('/reference/backlogs/registration-ticketing', 'fe3'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/CONTRIBUTING',
                component: ComponentCreator('/reference/CONTRIBUTING', 'c8d'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/data-dictionary-p1',
                component: ComponentCreator('/reference/data-dictionary-p1', 'd55'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/diagrams/architecture-global',
                component: ComponentCreator('/reference/diagrams/architecture-global', 'c99'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/diagrams/event-publication-flow',
                component: ComponentCreator('/reference/diagrams/event-publication-flow', 'f08'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/diagrams/readme',
                component: ComponentCreator('/reference/diagrams/readme', 'aa2'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/diagrams/registration-waitlist-flow',
                component: ComponentCreator('/reference/diagrams/registration-waitlist-flow', 'c8e'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/ideas/ideas',
                component: ComponentCreator('/reference/ideas/ideas', '5e7'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/mvp-scope',
                component: ComponentCreator('/reference/mvp-scope', '50f'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/navigation',
                component: ComponentCreator('/reference/navigation', 'c3f'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/overview',
                component: ComponentCreator('/reference/overview', 'bee'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/planning/release_plan',
                component: ComponentCreator('/reference/planning/release_plan', '8a6'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/planning/roadmap_sprints',
                component: ComponentCreator('/reference/planning/roadmap_sprints', 'f06'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/planning/team_work_split',
                component: ComponentCreator('/reference/planning/team_work_split', 'cc6'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/QUICK_START',
                component: ComponentCreator('/reference/QUICK_START', '2a0'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/releases/release_TEMPLATE',
                component: ComponentCreator('/reference/releases/release_TEMPLATE', '473'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/services/catalog-search-service',
                component: ComponentCreator('/reference/services/catalog-search-service', '136'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/services/event-management-service',
                component: ComponentCreator('/reference/services/event-management-service', '516'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/services/identity-access-service',
                component: ComponentCreator('/reference/services/identity-access-service', 'cff'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/services/registration-service',
                component: ComponentCreator('/reference/services/registration-service', 'e63'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-0-architecture-foundation',
                component: ComponentCreator('/reference/sprints/sprint-0-architecture-foundation', 'bf4'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-1-mvp',
                component: ComponentCreator('/reference/sprints/sprint-1-mvp', '1de'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-1-tracker',
                component: ComponentCreator('/reference/sprints/sprint-1-tracker', '61a'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-2-ticketing-notifications',
                component: ComponentCreator('/reference/sprints/sprint-2-ticketing-notifications', '67e'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-3-admin-moderation',
                component: ComponentCreator('/reference/sprints/sprint-3-admin-moderation', 'a45'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/sprints/sprint-4-payment-extensions',
                component: ComponentCreator('/reference/sprints/sprint-4-payment-extensions', 'c45'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/task_history',
                component: ComponentCreator('/reference/task_history', 'ca0'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/templates/TemplateBackendServiceSpec',
                component: ComponentCreator('/reference/templates/TemplateBackendServiceSpec', '585'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/test-plan-acceptance-matrix',
                component: ComponentCreator('/reference/test-plan-acceptance-matrix', '457'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/test-plan-role-regression',
                component: ComponentCreator('/reference/test-plan-role-regression', '370'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/test-plan-smoke-mvp',
                component: ComponentCreator('/reference/test-plan-smoke-mvp', '400'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/user_stories/user_stories_table',
                component: ComponentCreator('/reference/user_stories/user_stories_table', '38f'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/workflows/backend',
                component: ComponentCreator('/reference/workflows/backend', '713'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/workflows/backend-event-domain',
                component: ComponentCreator('/reference/workflows/backend-event-domain', '528'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/workflows/frontend',
                component: ComponentCreator('/reference/workflows/frontend', '01b'),
                exact: true,
                sidebar: "referenceSidebar"
              },
              {
                path: '/reference/workflows/frontend-event-portal',
                component: ComponentCreator('/reference/workflows/frontend-event-portal', 'fb4'),
                exact: true,
                sidebar: "referenceSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '070'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
