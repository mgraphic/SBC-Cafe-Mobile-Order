FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm i
RUN npm run build
