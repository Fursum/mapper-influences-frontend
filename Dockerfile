# Start from low size builder image
FROM node:24-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install the exact versions from the lockfile
RUN npm ci --ignore-scripts

# Copy the rest of the files
COPY ./src ./src
COPY ./public ./public
COPY ./.env.template ./.env.local
COPY ./tsconfig.json ./
COPY ./next.config.js ./
COPY ./next-env.d.ts ./
COPY ./biome.json ./
# Tailwind utilities are not built without these two
COPY ./tailwind.config.js ./
COPY ./postcss.config.js ./

# Run the app
CMD npm run dev
