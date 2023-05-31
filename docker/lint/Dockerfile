FROM node:20.2-alpine
RUN mkdir -p /code
WORKDIR /code
COPY .eslint* ./
COPY package.json .
COPY package-lock.json .
COPY formatter.js .
RUN npm ci
CMD npm run start
