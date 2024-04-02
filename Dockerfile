FROM node:18.17.1-alpine AS node

RUN apk update && apk add bash

RUN npm install -g pnpm

FROM node AS builder

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./packages/api/package.json ./packages/api/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/web/package.json ./packages/web/package.json

RUN pnpm install

COPY . .

RUN pnpm --filter @mini-aws-mock/api run build
RUN pnpm --filter @mini-aws-mock/web run build

FROM node AS final

WORKDIR /app

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./packages/api/package.json ./packages/api/package.json
COPY ./packages/shared/package.json ./packages/shared/package.json
COPY ./packages/web/package.json ./packages/web/package.json

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder /app/packages/web/node_modules ./packages/web/node_modules

# Api
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Web UI
COPY --from=builder /app/packages/web/dist ./packages/web/dist
COPY ./docker-scripts/web/modify-spa-index-file.sh ./modify-spa-index-file.sh
RUN chmod +x ./modify-spa-index-file.sh
RUN ./modify-spa-index-file.sh
RUN rm ./modify-spa-index-file.sh
COPY ./packages/web/shims/nestjs-swagger.shim.js ./packages/web/dist/assets/nestjs-swagger.shim.js


RUN pnpm prune --prod

EXPOSE 3000
EXPOSE 8000

ENTRYPOINT ["pnpm", "run", "prod"]
