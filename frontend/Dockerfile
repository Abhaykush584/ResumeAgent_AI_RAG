# ============================================================
# Stage 1: Build React app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first → Docker cache layer
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source & build
COPY . .
RUN npm run build


# ============================================================
# Stage 2: Serve with Nginx (tiny image)
# ============================================================
FROM nginx:1.27-alpine AS runtime

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy Vite dist output
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config that proxies /api → backend service
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
