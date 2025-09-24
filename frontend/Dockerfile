# FROM node:20-slim AS build
FROM node:22 AS build

ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NEXT_PUBLIC_MAP_DEFAULT_LATITUDE
ARG NEXT_PUBLIC_MAP_DEFAULT_LONGITUDE
ARG NEXT_PUBLIC_MAP_DEFAULT_ZOOM
ARG NEXT_PUBLIC_DEFAULT_ZOOM_FOR_COLLECTION_RANGE
ARG NEXT_PUBLIC_DATASET_LIST_BY
ARG NEXT_PUBLIC_BACKEND_URL
ARG GENERAL_USER_KEYCLOAK_CLIENT_ID
ARG GENERAL_USER_KEYCLOAK_CLIENT_SECRET
ARG ADMIN_KEYCLOAK_CLIENT_ID
ARG ADMIN_KEYCLOAK_CLIENT_SECRET
ARG BASIC_AUTH_CLIENT_ID
ARG BASIC_AUTH_CLIENT_SECRET
ARG SERVICE_ACCOUNT_CLIENT_ID
ARG SERVICE_ACCOUNT_CLIENT_SECRET
ARG KEYCLOAK_CLIENT_ISSUER

WORKDIR /app/frontend

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y tzdata

COPY --chown=node:node . .
RUN rm next.config.mjs && mv next.config.mjs.standalone next.config.mjs

ENV NODE_ENV=development
RUN npm ci

ENV NODE_ENV=production
RUN npm run build

USER node

FROM node:22-slim AS production

WORKDIR /app/frontend

RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y tzdata tini curl && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --chown=node:node --from=build /app/frontend/next.config.mjs .
COPY --chown=node:node --from=build /app/frontend/public ./public
COPY --chown=node:node --from=build /app/frontend/.next/static ./.next/static
COPY --chown=node:node --from=build /app/frontend/.next/standalone ./

EXPOSE 3000

USER node
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD [ "node", "server.js" ]
