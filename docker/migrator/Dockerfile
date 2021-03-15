FROM node:14.16.0 as builder

RUN mkdir -p /app
COPY ./package.json /app
COPY ./yarn.lock /app

WORKDIR /app
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --non-interactive --production

FROM node:14.16.0-alpine3.10
RUN mkdir /app && chown -R node:node /app
COPY --chown=node:node --from=builder /app /app
COPY --chown=node:node . /app

USER node
WORKDIR /app
ENTRYPOINT ["yarn", "run"]
CMD ["up"]
