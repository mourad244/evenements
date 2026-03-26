FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@10.33.0 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json

RUN pnpm install --frozen-lockfile --filter event-platform-frontend...

COPY frontend ./frontend

ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN pnpm --filter event-platform-frontend build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /workspace

COPY --from=builder /workspace/frontend/.next/standalone ./
COPY --from=builder /workspace/frontend/.next/static ./frontend/.next/static
COPY --from=builder /workspace/frontend/public ./frontend/public

EXPOSE 3000

CMD ["node", "frontend/server.js"]
