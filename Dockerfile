FROM node:20.4 AS build-env

COPY . /build
WORKDIR /build
RUN yarn
RUN yarn prisma generate
RUN yarn compile
RUN wget https://github.com/TryGhost/node-sqlite3/releases/download/v5.1.2/napi-v6-linux-musl-x64.tar.gz && tar -xvzf napi-v6-linux-musl-x64.tar.gz
RUN mv ./napi-v6-linux-musl-x64 /build/node_modules/sqlite3/lib/binding

FROM node:20.4

COPY --from=build-env /build/dist /app
COPY --from=build-env /build/node_modules /app/node_modules
COPY package.json /app

WORKDIR /app

CMD yarn prisma migrate deploy && npx tsx ./index.js
