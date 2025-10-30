FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @linkvault/shared build
RUN pnpm --filter web build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
