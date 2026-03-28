FROM node:20-alpine

WORKDIR /app/services/identity-access-service

COPY services/identity-access-service/package.json ./
RUN npm install --omit=dev

COPY services/identity-access-service/src ./src
COPY services/shared /app/services/shared

EXPOSE 4001

CMD ["node", "src/index.js"]
