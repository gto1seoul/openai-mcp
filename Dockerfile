FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && \
    pnpm install

# Copy application code
COPY . .

# Build the application
RUN pnpm run build

# Command will be provided by smithery.yaml
CMD ["node", "dist/index.js"]
