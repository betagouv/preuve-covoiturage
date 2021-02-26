FROM node:12
RUN curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
RUN yarn global add db-migrate db-migrate-pg
RUN yarn global add pino-pretty
EXPOSE 8080
