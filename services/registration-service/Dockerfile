FROM node:20-alpine

WORKDIR /app/services/registration-service

COPY services/registration-service/package.json ./
RUN npm install --omit=dev

COPY services/registration-service/src ./src
COPY services/registration-service/migrations ./migrations
COPY services/shared /app/services/shared

EXPOSE 4003

CMD ["node", "src/index.js"]
