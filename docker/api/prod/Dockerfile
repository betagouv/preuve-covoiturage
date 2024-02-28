FROM node:20.11-alpine as builder

RUN apk add just
RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN just rebuild 

FROM node:20.11-alpine
RUN apk add p7zip just
RUN mkdir /app && chown -R node:node /app
COPY --chown=node:node --from=builder /app /app

USER node
WORKDIR /app/api
CMD ["npm", "run", "start"]
