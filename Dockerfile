FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY pnpm-lock.yaml package.json ./

# ESTA ES LA CLAVE: Montar el caché de pnpm para que sea persistente entre builds
FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# Build args for Vite env vars (must be declared here to be available during build)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_BASE_DOMAIN
ENV VITE_BASE_DOMAIN=$VITE_BASE_DOMAIN
RUN pnpm run build

# Etapa final: Nginx (lo más profesional para Vite/React)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
