# --- builder image ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm ci --include-workspace-root
COPY . .
RUN npm run --workspace client build

# --- runtime image ---
FROM nginxinc/nginx-unprivileged:1.28-alpine
USER root
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY --from=builder /app/client/nginx.conf /etc/nginx/nginx.conf
RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/nginx.conf
USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]