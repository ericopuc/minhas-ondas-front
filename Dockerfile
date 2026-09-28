# etapa 1: build da aplicação (gera os arquivos estáticos em .output/public)
FROM node:22-alpine AS build

WORKDIR /app

# dependências primeiro, para aproveitar o cache das camadas
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# endereço da API usado pelo navegador (a porta publicada no host)
ARG NUXT_PUBLIC_API_URL=http://127.0.0.1:5000
ENV NUXT_PUBLIC_API_URL=$NUXT_PUBLIC_API_URL

RUN npm run generate

# etapa 2: servir os arquivos gerados com nginx
FROM nginx:1.27-alpine

COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 80
