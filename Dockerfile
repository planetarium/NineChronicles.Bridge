FROM node:22.10 AS build-env

COPY . /build
WORKDIR /build
RUN corepack enable
RUN yarn install --immutable
RUN yarn compile

FROM node:22.10

COPY --from=build-env /build/prisma /app/prisma
COPY --from=build-env /build/dist /app
COPY --from=build-env /build/node_modules /app/node_modules
COPY package.json /app

WORKDIR /app
ENTRYPOINT ["/usr/local/bin/node", "index.js"]
