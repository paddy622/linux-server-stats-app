FROM node:20-alpine

# Install Docker CLI
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8080
CMD ["node", "server.js"]