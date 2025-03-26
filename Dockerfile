FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Smithery에서는 환경 변수를 통해 설정되므로 기본값은 제거
ENV SMITHERY_STDIO_MODE=true

# 명시적 CMD 설정
CMD ["node", "server.js"]
