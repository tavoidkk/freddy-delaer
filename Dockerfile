FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN (bun install) || (npm install) || (corepack enable && pnpm install)
RUN (bun run build) || npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && npm i -g serve@14
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["sh","-c","if [ -f dist/server/entry.mjs ]; then node dist/server/entry.mjs; elif [ -f dist/client/index.html ]; then serve -s dist/client -l 3000; elif [ -f dist/index.html ]; then serve -s dist -l 3000; else ls -la dist; fi"]
