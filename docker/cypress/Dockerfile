FROM cypress/browsers:node16.5.0-chrome94-ff93
RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

ENV CI=1
RUN npm ci
COPY ./cypress /app/cypress
COPY ./cypress.json /app/cypress.json
COPY ./tsconfig.json /app/tsconfig.json

ENTRYPOINT ["sh", "-c"]
CMD ["npm run cy:verify && npm run cy:run"]