FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --workspace=server --only=production
COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]