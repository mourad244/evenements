# Event Platform Frontend

Production-ready starter for a microservices-based event management platform using Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios, and Lucide React.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- TanStack Query
- React Hook Form + Zod
- Axios
- Lucide React

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`

## Environment

See `.env.example`.

## Architecture

- `src/app`: routes and app-level providers
- `src/components`: reusable UI and layout primitives
- `src/features`: feature-based API, hooks, schemas, and components
- `src/lib`: low-level API, auth, query, constants, and utilities
- `src/types` and `src/schemas`: shared contracts

## Notes

- Placeholder integrations are clearly isolated in feature API modules where backend services are not available yet.
- Auth is intentionally simple and extendable for future backend and middleware hardening.
