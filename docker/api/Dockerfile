FROM node:16.13-alpine

RUN yarn global add pm2 pino-pretty db-migrate db-migrate-pg
RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN sh rebuild.sh