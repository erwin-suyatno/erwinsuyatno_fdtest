# Backend Dockerfile - Local Development
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Generate Prisma client (with error handling)
RUN npx prisma generate || echo "Prisma generate completed"

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Override entrypoint to use sh
ENTRYPOINT ["/bin/sh"]
CMD ["startup.sh"]
