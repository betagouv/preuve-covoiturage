
FROM node:20.2-alpine
RUN mkdir -p /app

WORKDIR /app
COPY ./package.json /app
COPY ./yarn.lock /app
RUN yarn install
COPY ./index.js /app
CMD ["node", "index.js"]
