FROM node:14-alpine
RUN mkdir -p /code
WORKDIR /code
COPY .eslint* ./
COPY .prettier* ./
COPY package.json .
COPY yarn.lock .
COPY formatter.js .
RUN yarn
CMD yarn start
