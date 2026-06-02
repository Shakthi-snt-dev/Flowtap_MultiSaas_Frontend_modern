FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/ui-core/package.json ./packages/ui-core/
COPY packages/store/package.json ./packages/store/
COPY packages/api-core/package.json ./packages/api-core/
COPY packages/shared/package.json ./packages/shared/
COPY packages/pages-core/package.json ./packages/pages-core/
COPY apps/food/package.json ./apps/food/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/food/ ./apps/food/
COPY tsconfig.base.json ./

ARG VITE_API_BASE_URL
ARG VITE_SIGNALR_URL
ARG VITE_APP_TITLE
ARG VITE_INDUSTRY

RUN pnpm --filter @flowtap/app-food build

FROM nginx:alpine
COPY --from=builder /app/apps/food/dist /usr/share/nginx/html
COPY apps/food/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
