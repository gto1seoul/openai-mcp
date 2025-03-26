FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN chmod +x server.js

ENV NODE_ENV=production

CMD ["node", "server.js"]
