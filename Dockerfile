FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN (bun install) || (npm install) || (corepack enable && pnpm install)
RUN (bun run build:static || NITRO_PRESET=node-server bun run build) || npm run build
RUN mkdir -p /out \
 && (cp -r .output /out/.output 2>/dev/null || true) \
 && (cp -r dist /out/dist 2>/dev/null || true) \
 && (cp -r dist-static /out/dist-static 2>/dev/null || true)

FROM node:22-slim
WORKDIR /app
COPY --from=build /out ./
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && npm i -g serve@14
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
CMD ["sh","-c","if [ -f .output/server/index.mjs ]; then node .output/server/index.mjs; elif [ -f dist/server/entry.mjs ]; then node dist/server/entry.mjs; elif [ -f dist-static/index.html ]; then serve -s dist-static -l 3000; elif [ -f dist/client/index.html ]; then serve -s dist/client -l 3000; elif [ -f dist/index.html ]; then serve -s dist -l 3000; else serve -s dist -l 3000; fi"]
