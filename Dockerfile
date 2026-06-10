# syntax=docker/dockerfile:1

# ============================================================
# Stage 1 — Build da aplicação (Vite + React)
# ============================================================
FROM node:22-alpine AS build

WORKDIR /app

# URL da API consumida pelo front-end.
# IMPORTANTE: o Vite injeta variáveis VITE_* em BUILD-TIME, não em runtime.
# No EasyPanel, configure este valor em "Build" > "Build Args".
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Instala dependências a partir do lockfile (builds reproduzíveis)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera os assets de produção em /app/dist
COPY . .
RUN npm run build

# ============================================================
# Stage 2 — Servidor estático (nginx)
# ============================================================
FROM nginx:alpine AS production

# Configuração com fallback de SPA para o react-router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os assets gerados no stage de build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Healthcheck simples — garante que o nginx está respondendo
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
