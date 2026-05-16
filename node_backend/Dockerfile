FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]
