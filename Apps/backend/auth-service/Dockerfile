FROM node:20.17.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY custom_modules ./custom_modules
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.17.0-alpine AS runtime
WORKDIR /app
COPY package*.json ./
COPY custom_modules ./custom_modules
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
ENV PORT=3100
EXPOSE 3100
CMD ["npm", "run", "prod"]
