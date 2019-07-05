FROM node:8-jessie

USER node

RUN mkdir -p /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app

RUN npm install
