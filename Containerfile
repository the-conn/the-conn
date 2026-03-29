FROM docker.io/node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM docker.io/node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_PUBLIC_API_BASE_URL=__APP_API_BASE_URL__
ENV NEXT_PUBLIC_SIDEBAR_LIMIT=__APP_SIDEBAR_LIMIT__
ENV NEXT_PUBLIC_GIT_BASE_URL=__APP_GIT_BASE_URL__
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM docker.io/node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache bash

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY container/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chgrp -R 0 /app /usr/local/bin/entrypoint.sh \
    && chmod -R g=u /app /usr/local/bin/entrypoint.sh

USER 1001
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server.js"]
