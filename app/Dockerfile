FROM node:8-jessie

USER node

RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json .
RUN npm install

COPY gulpfile.js .
COPY src ./src
