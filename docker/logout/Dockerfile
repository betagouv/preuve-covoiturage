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

WORKDIR /app

RUN chown -R deno:deno /app/

USER deno

COPY --chown=deno:deno ./main.ts /app

RUN deno cache main.ts
CMD ["deno", "run", "-A", "main.ts"]