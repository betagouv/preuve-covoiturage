ARG DENO_VERSION=2.2.0
ARG BIN_IMAGE=denoland/deno:bin-${DENO_VERSION}
FROM ${BIN_IMAGE} AS bin
FROM ubuntu:24.04
RUN useradd --uid 1993 --user-group deno \
  && mkdir /app/ \
  && chown deno:deno /app/

ENV DENO_DIR /app/
ENV DENO_INSTALL_ROOT /usr/local

ARG DENO_VERSION
ENV DENO_VERSION=${DENO_VERSION}
COPY --from=bin /deno /usr/bin/deno

RUN apt update && apt install -y just p7zip bash

USER deno
WORKDIR /app
COPY --chown=deno:deno ./api/justfile /app
COPY --chown=deno:deno ./api/deno.lock /app
RUN just install

COPY --chown=deno:deno ./api /app
RUN just cache
CMD ["just", "serve"]