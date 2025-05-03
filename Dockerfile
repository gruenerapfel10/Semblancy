FROM node:18 AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:18 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile --network-timeout=300000 || \
    (sleep 3 && pnpm install --prod --frozen-lockfile --network-timeout=300000) || \
    (sleep 10 && pnpm install --prod --frozen-lockfile --network-timeout=300000)
EXPOSE 3000
CMD ["pnpm", "start"]