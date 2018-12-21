# from https://hub.docker.com/r/odlevakp/arena/dockerfile
# upgraded with latest version

FROM node:8-alpine
LABEL version "2.5.2"
LABEL description "Arena web GUI in an alpine based docker image."

ENV VERSION 2.5.2

RUN mkdir -p /home/arena && \
    addgroup -S arena && \
    adduser -S -G arena arena && \
    apk add --no-cache ca-certificates wget && \
    cd /tmp && \
    wget https://github.com/bee-queue/arena/archive/v${VERSION}.tar.gz && \
    tar xfz v${VERSION}.tar.gz && \
    mv arena-${VERSION} /opt/arena && \
    rm -fr /tmp/*.tar.gz

WORKDIR /opt/arena

RUN yarn --production && \
    chown -R arena:arena /opt/arena && \
    apk del wget ca-certificates && \
    rm -rf /usr/include /etc/ssl /usr/share/man \
      /usr/local/share/.cache/yarn /tmp/* /var/cache/apk/*

USER arena

EXPOSE 4567

CMD ["yarn", "start"]
