# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependencies files
COPY package*.json ./

# Install dependencies (prod only)
RUN npm install --omit=dev

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build


EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
