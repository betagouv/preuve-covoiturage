FROM node:12 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
ENV NODE_ENV=production
RUN sh rebuild.sh

FROM node:12.19.1-alpine3.12
RUN mkdir /app && chown -R node:node /app
COPY --chown=node:node --from=builder /app /app

USER node
WORKDIR /app/api
CMD ["yarn", "start:http"]