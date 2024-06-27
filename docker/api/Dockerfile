FROM alpine:3.20

RUN apk add --no-cache just deno p7zip

RUN addgroup --gid 1000 deno \
  && adduser --uid 1000 --disabled-password deno --ingroup deno \
  && mkdir /app/ \
  && chown deno:deno /app/

USER deno
RUN mkdir -p /app/shared
RUN mkdir -p /app/api

COPY ./shared /app/shared
COPY ./api /app/api

WORKDIR /app/api
RUN deno cache --lock deno.lock src/deps.ts
CMD ["just", "serve"]