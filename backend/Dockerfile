# 共通ベース（脆弱性対応済み）
FROM node:22-slim AS base
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y tzdata tini curl && \
    rm -rf /var/lib/apt/lists/*

# 開発用ステージ
FROM base AS dev
ENV NODE_ENV=development

# ビルドステージ（本番用）
FROM base AS build
WORKDIR /app/backend
ENV NODE_ENV=development
COPY --chown=node:node . .
RUN npm ci && npm run build
USER node

# 本番用ステージ
FROM base AS production
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --chown=node:node package*.json .
RUN npm ci --omit=dev --ignore-scripts
COPY --chown=node:node --from=build /app/backend/dist ./dist

EXPOSE 4000
USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD [ "node", "dist/main.js" ]
