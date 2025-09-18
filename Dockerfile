FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++ 
WORKDIR /app

FROM base AS deps
WORKDIR /app
# Install corepack and enable Yarn 3
RUN corepack enable && corepack prepare yarn@3.2.3 --activate
# Copy Yarn configuration and releases
COPY .yarnrc.yml ./
COPY .yarn .yarn
# Copy package files
COPY package.json yarn.lock ./
COPY packages/nextjs/package.json ./packages/nextjs/package.json
COPY .env ./packages/nextjs/.env
# Install dependencies
RUN yarn install

# Dependencies stage for docs app
FROM base AS docs-deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@3.2.3 --activate
# Copy workspace configuration
COPY .yarnrc.yml ./
COPY .yarn .yarn
COPY package.json yarn.lock ./
COPY packages/docs/package.json ./packages/docs/package.json
COPY packages/docs/.env.example ./packages/docs/.env.example
RUN yarn install 
# Copy docs source and build within workspace (Yarn 3)
COPY packages/docs/ ./packages/docs
RUN yarn workspace @q3x/docs build
WORKDIR /app/packages/docs

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
WORKDIR /app/packages/nextjs
COPY packages/nextjs .
RUN yarn workspace @q3x/nextjs build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/packages/nextjs/public ./packages/nextjs/public
COPY --from=builder /app/packages/nextjs/.next/standalone/packages/nextjs ./packages/nextjs
COPY --from=builder /app/packages/nextjs/.next/static ./packages/nextjs/.next/static

# Copy docs app
COPY --from=docs-deps /app/packages/docs/build ./docs/build

# Create a simple start script
RUN printf '#!/bin/sh\n\
cd /app/docs && npx serve -s build -l 3001 --single &\n\
cd /app/packages/nextjs && node server.js\n' > /app/start.sh
RUN chmod +x /app/start.sh

ARG PORT=3000
ENV NODE_ENV=production
ENV PORT=$PORT
ENV GENERATE_SOURCEMAP=false
EXPOSE $PORT

CMD ["/app/start.sh"]
