FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Nenhum banco real e acessado durante o build.
RUN DATABASE_URL="postgresql://store:placeholder@localhost:5432/store?schema=public" npm run generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 4000
USER node

# Aplica migrations pendentes sem perder dados.
CMD ["sh", "-c", "npm run migrate:deploy && exec npm run start"]
