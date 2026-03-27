FROM node:20-alpine

WORKDIR /app/services/event-management-service

COPY services/event-management-service/package.json ./
RUN npm install --omit=dev

COPY services/event-management-service/src ./src
COPY services/event-management-service/migrations ./migrations
COPY services/shared /app/services/shared

EXPOSE 4002

CMD ["node", "src/index.js"]
