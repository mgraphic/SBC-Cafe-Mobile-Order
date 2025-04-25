FROM node:20.17.0-alpine AS builder

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build
RUN npm run pack
