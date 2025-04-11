FROM node:20.17.0-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

ENV PORT=3100

EXPOSE 3100

CMD ["npm", "run", "prod"]
