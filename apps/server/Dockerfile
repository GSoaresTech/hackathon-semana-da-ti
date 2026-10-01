# Build a partir da raiz do monorepo:
#   docker build -f apps/server/Dockerfile .

# Stage 1 — prune: recorta o monorepo só com o que o server usa
FROM node:22 AS pruner

WORKDIR /opt/app

RUN npm install -g turbo@^2

COPY . .

RUN turbo prune @triar-app/server --docker

# Stage 2 — build
FROM node:22 AS builder

WORKDIR /opt/app

COPY --from=pruner /opt/app/out/json/ ./

RUN npm ci

COPY --from=pruner /opt/app/out/full/ ./

RUN npx turbo run build --filter=@triar-app/server

# Stage 3 — release
FROM node:22 AS release

WORKDIR /opt/app

COPY --from=pruner /opt/app/out/json/ ./

RUN npm ci --omit=dev

COPY --from=builder /opt/app/apps/server/dist ./apps/server/dist

WORKDIR /opt/app/apps/server

CMD ["node", "dist/server.js"]
