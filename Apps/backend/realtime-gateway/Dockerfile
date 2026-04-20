FROM node:20.17.0-alpine

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

ENV PORT=3200

EXPOSE 3200

CMD ["npm", "run", "prod"]
