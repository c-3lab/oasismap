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
WORKDIR /app/frontend
COPY --chown=node:node . .
RUN rm next.config.mjs && mv next.config.mjs.standalone next.config.mjs
ENV NODE_ENV=development
RUN npm ci
ENV NODE_ENV=production
RUN npm run build
USER node

# 本番用ステージ
FROM base AS production
WORKDIR /app/frontend
COPY --chown=node:node --from=build /app/frontend/next.config.mjs .
COPY --chown=node:node --from=build /app/frontend/public ./public
COPY --chown=node:node --from=build /app/frontend/.next/static ./.next/static
COPY --chown=node:node --from=build /app/frontend/.next/standalone ./
EXPOSE 3000
USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD [ "node", "server.js" ]
