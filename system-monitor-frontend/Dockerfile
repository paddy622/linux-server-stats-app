# Multi-stage build for optimized production image
# NOTE: This Dockerfile should be run from the project root directory:
# docker build -f system-monitor-frontend/Dockerfile -t frontend .

# Stage 1: Build the TypeScript React application
FROM node:20-alpine AS builder

# Install build dependencies and configure npm for better network handling
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-factor 2 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 60000

WORKDIR /app

# Copy shared-types and build it first
COPY ./shared-types/ ./shared-types/
WORKDIR /app/shared-types
RUN npm install && npm run build

# Copy frontend and build it
WORKDIR /app/frontend
COPY system-monitor-frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY system-monitor-frontend/ ./
RUN npm run build

# Stage 2: Production server
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY system-monitor-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]