FROM node:20-alpine

# Install Docker CLI for runtime
RUN apk add --no-cache docker-cli

WORKDIR /workspace

# Copy and build shared types first
COPY shared-types/ ./shared-types/
WORKDIR /workspace/shared-types
RUN npm install && npm run build

# Copy server files and install dependencies
WORKDIR /workspace/system-monitor-server
COPY system-monitor-server/package*.json ./
RUN npm install

# Copy server source code
COPY system-monitor-server/ ./

# Build TypeScript
RUN npm run build

EXPOSE 8080
CMD ["npm", "run", "start"]