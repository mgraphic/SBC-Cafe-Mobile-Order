# Base Image:
FROM node:20.17.0-alpine AS base
WORKDIR /app

# Build Container:
FROM base AS build
ARG APP_NAME
COPY package.json ./
COPY custom_modules ./custom_modules
RUN npm i
COPY . .
RUN npm run build ${APP_NAME}

# Web Container:
FROM nginx:stable
ARG APP_NAME
RUN rm /usr/share/nginx/html/*
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/${APP_NAME}/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
