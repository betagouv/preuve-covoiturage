FROM node:16.13 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/dashboard

COPY ./shared /app/shared
COPY ./dashboard /app/dashboard

WORKDIR /app/dashboard
RUN yarn install --frozen-lockfile --non-interactive
ENV NODE_ENV=production
RUN yarn build

FROM nginx:1.21-alpine
COPY --chown=nginx:nginx --from=builder /app/dashboard/dist/dashboard /usr/share/nginx/html
COPY --chown=nginx:nginx ./docker/dashboard/prod/nginx/default.conf /etc/nginx/conf.d
EXPOSE 8080