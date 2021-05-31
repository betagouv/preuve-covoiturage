FROM node:14.16.0 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN sh rebuild.sh production
RUN yarn global add pino-pretty

EXPOSE 8080
CMD ["yarn", "start:http"]
