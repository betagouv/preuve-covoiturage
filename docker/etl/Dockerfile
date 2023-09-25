FROM node:20.2-alpine
RUN apk add --update --no-cache p7zip
RUN mkdir -p /etl
COPY ./etl /etl
WORKDIR /etl
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start"]