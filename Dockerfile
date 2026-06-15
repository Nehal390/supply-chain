FROM node:20

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @workspace/supply-chain build
RUN pnpm --filter @workspace/api-server build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "--filter", "@workspace/api-server", "start"]