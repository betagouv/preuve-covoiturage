FROM cypress/browsers:node14.17.0-chrome91-ff89
RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

ENV CI=1
RUN yarn install
COPY ./cypress /app/cypress
COPY ./cypress.json /app/cypress.json
COPY ./tsconfig.json /app/tsconfig.json

ENTRYPOINT ["sh", "-c"]
CMD ["yarn run cy:verify && yarn run cy:run"]