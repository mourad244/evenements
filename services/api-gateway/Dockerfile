FROM node:20-alpine

WORKDIR /app/services/api-gateway

COPY services/api-gateway/package.json ./
RUN npm install --omit=dev

COPY services/api-gateway/src ./src
COPY services/shared /app/services/shared

EXPOSE 4000

CMD ["node", "src/index.js"]
