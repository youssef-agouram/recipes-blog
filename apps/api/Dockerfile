FROM node:20-alpine

# Install OpenSSL 1.1 and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
