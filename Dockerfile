FROM node:24.11.1-alpine AS pnpm-base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack prepare pnpm@10.23.0 --activate
RUN corepack enable

FROM pnpm-base AS builder-base

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./packages/api/package.json ./packages/api/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/web/package.json ./packages/web/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

FROM builder-base AS builder-api

WORKDIR /app

RUN pnpm run --filter @mini-aws-mock/api build
RUN pnpm deploy --filter @mini-aws-mock/api --prod /app/packages/api/production-deploy --legacy

FROM builder-base AS builder-web

WORKDIR /app

# Required for `modify-spa-index-file.sh` script
RUN apk update && apk add bash

RUN pnpm run --filter @mini-aws-mock/web build

# Workaround to replace `@nestjs/swagger` import with static asset
COPY ./docker-scripts/web/modify-spa-index-file.sh ./modify-spa-index-file.sh
RUN chmod +x ./modify-spa-index-file.sh
RUN ./modify-spa-index-file.sh
RUN rm ./modify-spa-index-file.sh
COPY ./packages/web/shims/nestjs-swagger.shim.js ./packages/web/dist/assets/nestjs-swagger.shim.js

FROM node:24.11.1-alpine AS runtime

RUN npm i -g serve@^14.2.1 concurrently@^9.0.0

# Copy production ready API build
COPY --from=builder-api /app/packages/api/production-deploy /app/packages/api

# Copy production ready Web UI build
COPY --from=builder-web /app/packages/web/package.json /app/packages/web/package.json
COPY --from=builder-web /app/packages/web/dist /app/packages/web/dist

EXPOSE 3000
EXPOSE 8000

ENTRYPOINT ["concurrently", "\"npm run --prefix /app/packages/api start:prod\"", "\"npm run --prefix /app/packages/web start:prod\"", "--names", "api,web"]
