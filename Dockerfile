FROM node:20-slim

WORKDIR /app

# Install required tools
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Set environment variable for OpenAI API key
# This will be overridden by the actual key at runtime
ENV OPENAI_API_KEY=""

# Run the MCP server
CMD ["node", "dist/index.js"]
