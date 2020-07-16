FROM node:12

RUN mkdir -p /data
RUN yarn global add db-migrate db-migrate-pg

COPY . /data
WORKDIR /data
CMD db-migrate up
