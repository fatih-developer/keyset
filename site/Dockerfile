FROM node:22-alpine AS builder

WORKDIR /app

COPY site/package.json site/package-lock.json ./site/
RUN npm ci --prefix site

COPY docs ./docs
COPY site ./site

RUN npm run build --prefix site

FROM nginx:alpine

COPY --from=builder /app/site/out /usr/share/nginx/html
