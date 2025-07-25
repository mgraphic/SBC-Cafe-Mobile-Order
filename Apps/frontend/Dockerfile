# Base Image:
FROM node:22-alpine AS base
WORKDIR /app

# Build Container:
FROM base AS build
ARG APP_NAME
ARG CACHE_BUST=1
# Cache-busting timestamp: 2025-07-23-22:50
COPY package.json package-lock.json ./
COPY custom_modules ./custom_modules
RUN npm install
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
