FROM node:20.2 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/dashboard

COPY ./shared /app/shared
COPY ./dashboard /app/dashboard

WORKDIR /app/dashboard
RUN npm ci
ENV NODE_ENV=production
RUN npm run build

FROM nginx:1.21-alpine
COPY --chown=nginx:nginx --from=builder /app/dashboard/dist/dashboard /usr/share/nginx/html
COPY --chown=nginx:nginx ./docker/dashboard/prod/nginx/default.conf /etc/nginx/conf.d
EXPOSE 8080