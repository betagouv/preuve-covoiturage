FROM alpine:3.21

RUN apk add --no-cache just deno p7zip bash

RUN addgroup --gid 1000 deno \
  && adduser --uid 1000 --disabled-password deno --ingroup deno \
  && mkdir /app/ \
  && chown deno:deno /app/

USER deno
ENV DENO_INSTALL_ROOT /app
RUN mkdir -p /app/api

COPY --chown=deno:deno ./api /app/api

WORKDIR /app/api
RUN just cache
CMD ["just", "serve"]