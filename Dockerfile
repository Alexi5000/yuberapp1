FROM oven/bun:1

WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["bun", "run", "dev"]

