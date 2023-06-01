FROM node:20.2-alpine

RUN mkdir -p /app/shared
RUN mkdir -p /app/dashboard

COPY ./shared /app/shared
COPY ./dashboard /app/dashboard

WORKDIR /app/dashboard
RUN npm ci

EXPOSE 4200
CMD ["npm", "run", "start", "--port=4200", "--disable-host-check", "--host=0.0.0.0"]
