FROM node:14.18-alpine
RUN mkdir -p /code
WORKDIR /code
COPY .eslint* ./
COPY package.json .
COPY yarn.lock .
COPY formatter.js .
RUN yarn
CMD yarn start
