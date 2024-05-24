# Start from low size builder image
FROM node:22-alpine3.18 as builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --ignore-scripts true

# Copy the rest of the files
COPY ./src ./src
COPY ./public ./public
COPY ./.env.template ./.env.local
COPY ./tsconfig.json ./
COPY ./next.config.js ./
COPY ./next-env.d.ts ./
COPY ./biome.json ./

# Run the app
CMD npm run dev