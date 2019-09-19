FROM node:10-alpine
EXPOSE 4567

RUN mkdir -p /opt/arena
WORKDIR /opt/arena
COPY package.json /opt/arena
COPY server.js /opt/arena
COPY yarn.lock /opt/arena
RUN yarn --production

CMD ["yarn", "start"]
