FROM node:18-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
# production install (omit dev deps like nodemon)
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

# Your entry should start the HTTP server (server.js or app.js)
CMD ["node", "server.js"]
