FROM node:14.16.0-alpine

RUN yarn global add pm2 pino-pretty db-migrate db-migrate-pg
RUN mkdir -p /app/shared
RUN mkdir -p /app/api

WORKDIR /app/api/proxy
