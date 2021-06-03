FROM node:14.16.0

RUN mkdir -p /app/shared
RUN mkdir -p /app/dashboard

COPY ./shared /app/shared
COPY ./dashboard /app/dashboard

WORKDIR /app/dashboard
RUN yarn install

EXPOSE 8080
CMD ["yarn", "start", "--port=8080", "--disable-host-check", "--host=0.0.0.0"]
