FROM node:14 as builder

RUN mkdir -p /app/shared
RUN mkdir -p /app/dashboard

COPY ./shared /app/shared
COPY ./dashboard /app/dashboard

WORKDIR /app/dashboard
RUN yarn install --frozen-lockfile --non-interactive
ENV NODE_ENV=production
RUN yarn build

FROM nginx:1.19.4-alpine
COPY --from=builder /app/dashboard/dist/dashboard /usr/share/nginx/html
COPY ./docker/front/nginx/default.conf /etc/nginx/conf.d