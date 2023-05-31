
FROM node:20.2-alpine
RUN mkdir -p /app

WORKDIR /app
COPY ./package.json /app
COPY ./package-lock.json /app
RUN npm ci
COPY ./index.js /app
CMD ["node", "index.js"]
