FROM node:14-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
COPY .env ./
RUN yarn install
COPY . .
RUN apk add --update python3 py-pip
CMD yarn start