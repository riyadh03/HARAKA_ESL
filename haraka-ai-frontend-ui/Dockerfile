FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (using npm by default, falling back to others if needed)
RUN if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    elif [ -f yarn.lock ]; then yarn install; \
    else npm install; \
    fi

# Copy the rest of the code
COPY . .

# Expose ports for Vite and Express
EXPOSE 3000
EXPOSE 4000

# The CMD will be overridden by docker-compose for the different services
CMD ["npm", "run", "dev:full"]
