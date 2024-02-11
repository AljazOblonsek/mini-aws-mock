FROM node:18.17.1-alpine AS node

FROM node AS builder

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

FROM node AS final

WORKDIR /app

COPY package*.json .

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY ./public ./public
COPY ./scripts ./scripts
COPY ./tsconfig.json ./tsconfig.json

EXPOSE 8000

ENTRYPOINT ["npm", "run", "start:prod"]