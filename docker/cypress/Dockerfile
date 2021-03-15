FROM cypress/browsers:node14.15.0-chrome86-ff82

RUN mkdir -p /app

WORKDIR /app
COPY package.json /app
RUN npm install

COPY . /app

ENTRYPOINT ["sh", "-c"]
CMD ["npm run cy:verify && npm run cy:run"]