FROM node:18-slim

# Use repository root as build context so local file:.. package references work
WORKDIR /workspace
COPY . .

# Move into backend folder and install only backend dependencies
WORKDIR /workspace/Backend
RUN npm ci --production || npm ci

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "server.js"]
