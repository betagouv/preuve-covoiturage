FROM node:14
RUN curl -s --compressed -o- -L https://yarnpkg.com/install.sh | bash
RUN mkdir -p /code
WORKDIR /code
COPY .eslint* ./
COPY .prettier* ./
COPY package.json .
COPY yarn.lock .
COPY formatter.js .
CMD yarn start
