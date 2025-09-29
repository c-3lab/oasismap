FROM node:22-slim AS build

WORKDIR /app/backend

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y tzdata

ENV NODE_ENV=development

COPY --chown=node:node . .

RUN npm ci && npm run build

USER node

FROM node:22-slim AS production

WORKDIR /app/backend

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y tzdata tini wget && \
    apt-get autoremove -y && apt-get autoclean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV NODE_ENV=production

COPY --chown=node:node package*.json .

RUN npm ci --omit=dev --ignore-scripts

COPY --chown=node:node --from=build /app/backend/dist ./dist

EXPOSE 4000

USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD [ "node", "dist/main.js" ]

