# Base stage
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock .env.example ./
RUN yarn install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ARG PORT=3000
ENV NODE_ENV production
ENV PORT=$PORT
COPY --from=builder /app/build ./build
EXPOSE $PORT
CMD npx serve -s build -l ${PORT}
