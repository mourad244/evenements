FROM node:22-bookworm-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
RUN corepack prepare pnpm@8.5.1 --activate

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs-portal/package.json apps/docs-portal/package.json

RUN pnpm install --frozen-lockfile --filter docs-portal...

COPY apps/docs-portal ./apps/docs-portal
COPY docs ./docs

RUN pnpm --filter docs-portal build

FROM nginx:1.27-alpine AS runner

COPY apps/docs-portal/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/docs-portal/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
