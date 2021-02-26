FROM node:14.16.0 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN sh rebuild.sh production

FROM node:14.16.0-alpine3.10
RUN mkdir /app && chown -R node:node /app
COPY --chown=node:node --from=builder /app /app

USER node
WORKDIR /app/api
CMD ["yarn", "start:http"]