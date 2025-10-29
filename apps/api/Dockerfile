FROM node:20-alpine

# habilita pnpm
RUN corepack enable

WORKDIR /app

COPY pnpm-workspace.yaml pnpm-workspace.yaml
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY package.json package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

RUN pnpm -r install --frozen-lockfile

COPY . .

RUN pnpm -r build

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]