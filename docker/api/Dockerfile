FROM node:20.2-alpine

RUN apk add p7zip python3 make g++ cmake

RUN npm global add pm2 pino-pretty db-migrate db-migrate-pg
RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN sh rebuild.sh
