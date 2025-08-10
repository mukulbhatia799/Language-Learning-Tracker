# ---------- Build stage ----------
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source & build
COPY . .
# Build-time API base. In the browser we’ll hit the host’s mapped port 5000.
ARG VITE_API_BASE=http://localhost:5000/api
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ---------- Runtime (nginx) ----------
FROM nginx:alpine
# SPA fallback so client routing works
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static assets
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
