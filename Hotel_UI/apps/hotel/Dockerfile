FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/ui-core/package.json ./packages/ui-core/
COPY packages/store/package.json ./packages/store/
COPY packages/api-core/package.json ./packages/api-core/
COPY packages/shared/package.json ./packages/shared/
COPY packages/pages-core/package.json ./packages/pages-core/
COPY apps/hotel/package.json ./apps/hotel/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/hotel/ ./apps/hotel/
COPY tsconfig.base.json ./

ARG VITE_API_BASE_URL
ARG VITE_SIGNALR_URL
ARG VITE_APP_TITLE
ARG VITE_INDUSTRY

RUN pnpm --filter @flowtap/app-hotel build

FROM nginx:alpine
COPY --from=builder /app/apps/hotel/dist /usr/share/nginx/html
COPY apps/hotel/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
