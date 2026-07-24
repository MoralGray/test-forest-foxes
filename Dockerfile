# syntax=docker/dockerfile:1
FROM node:22 AS deps
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/forest-foxes-backend/package.json apps/forest-foxes-backend/
COPY apps/forest-foxes-frontend/package.json apps/forest-foxes-frontend/
COPY packages/mg-ui-shadcn-4/package.json packages/mg-ui-shadcn-4/
COPY packages/mg-table-tanstack/package.json packages/mg-table-tanstack/
COPY packages/mg-infinite-view-tanstack/package.json packages/mg-infinite-view-tanstack/
COPY packages/mg-api-axios-1/package.json packages/mg-api-axios-1/
COPY packages/mg-router-zustand-1/package.json packages/mg-router-zustand-1/
COPY packages/forest-foxes-shared-prisma/package.json packages/forest-foxes-shared-prisma/
COPY services/fox-engine/package.json services/fox-engine/

RUN npm ci

COPY packages/forest-foxes-shared-prisma/ packages/forest-foxes-shared-prisma/
RUN npx prisma generate --schema=packages/forest-foxes-shared-prisma/prisma/schema.prisma

FROM deps AS frontend-build
WORKDIR /app

COPY apps/forest-foxes-frontend/ apps/forest-foxes-frontend/
COPY packages/ packages/

RUN npm run -w forest-foxes-frontend build

FROM node:22-slim AS backend
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/package.json /app/package.json
COPY --from=deps /app/packages/forest-foxes-shared-prisma /app/packages/forest-foxes-shared-prisma

COPY apps/forest-foxes-backend/ apps/forest-foxes-backend/

# Pre-download Prisma engine while still root (can write to node_modules)
RUN npx prisma --version

RUN mkdir -p .db/forest-foxes && chown -R node:node .db

EXPOSE 8020

USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:8020/api/health').then(r=>{process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

CMD sh -c "npx prisma db push --schema=packages/forest-foxes-shared-prisma/prisma/schema.prisma --url='file:.db/forest-foxes/prod.db' && npx tsx --tsconfig apps/forest-foxes-backend/tsconfig.json apps/forest-foxes-backend/src/seed-locations.ts && npx tsx --tsconfig apps/forest-foxes-backend/tsconfig.json apps/forest-foxes-backend/src/main.ts"

FROM node:22-slim AS fox-engine
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/package.json /app/package.json

COPY services/fox-engine/ services/fox-engine/

USER node

CMD ["npx", "tsx", "services/fox-engine/src/index.ts"]

FROM nginx:alpine AS frontend
COPY --from=frontend-build /app/apps/forest-foxes-frontend/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
