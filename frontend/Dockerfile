# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_GOOGLE_SITE_VERIFICATION=
ARG VITE_NAVER_SITE_VERIFICATION=
ARG VITE_BING_SITE_VERIFICATION=
ARG VITE_GA_MEASUREMENT_ID=
ARG VITE_ADSENSE_CLIENT=
ARG VITE_ADSENSE_SLOT_FOOTER=
ENV VITE_GOOGLE_SITE_VERIFICATION=$VITE_GOOGLE_SITE_VERIFICATION
ENV VITE_NAVER_SITE_VERIFICATION=$VITE_NAVER_SITE_VERIFICATION
ENV VITE_BING_SITE_VERIFICATION=$VITE_BING_SITE_VERIFICATION
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID
ENV VITE_ADSENSE_CLIENT=$VITE_ADSENSE_CLIENT
ENV VITE_ADSENSE_SLOT_FOOTER=$VITE_ADSENSE_SLOT_FOOTER

COPY package.json package-lock.json ./
# npm ci fails when lockfile was generated on another OS; install is reliable in Alpine
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Runtime Stage ----
FROM nginx:1.27-alpine

RUN apk add --no-cache wget

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/http.conf
COPY nginx.ssl.conf.template /etc/nginx/templates/ssl.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/healthz || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
