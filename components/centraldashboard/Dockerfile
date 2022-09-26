# Step 1: Builds and tests
# This is a long-lived tag, if there is a vulnerability
# sometimes a rebuild will set you on your way.
FROM node:16-alpine AS build

ARG kubeflowversion
ARG commit
ENV BUILD_VERSION=$kubeflowversion
ENV BUILD_COMMIT=$commit
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Installs latest-stable Chromium package and configures environment for testing
RUN apk update && apk upgrade && \
    echo @stable http://nl.alpinelinux.org/alpine/v3.15/community >> /etc/apk/repositories && \
    echo @stable http://nl.alpinelinux.org/alpine/v3.15/main >> /etc/apk/repositories

RUN apk add --no-cache \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++ \
    git

RUN if [ "$(uname -m)" = "aarch64" ]; then \
        apk update && apk upgrade && \
        apk add --no-cache python2 make g++@stable; \
    fi

COPY . /centraldashboard
WORKDIR /centraldashboard

# --legacy-peer-deps is required in the update to node16
# https://github.com/pugjs/pug-loader/issues/126#issuecomment-796517327

RUN npm rebuild
RUN npm install -g npm@latest
RUN npm install --save ng2-charts --legacy-peer-deps
RUN npm install --save chart.js --legacy-peer-deps
RUN npm install --save pug@latest --legacy-peer-deps
RUN npm install --save pug-loader@latest --legacy-peer-deps
RUN npm install --save caniuse-lite@latest --legacy-peer-deps

RUN if [ "$(uname -m)" = "aarch64" ]; then \
        export CFLAGS=-Wno-error; \
        export CXXFLAGS=-Wno-error; \
    fi

RUN npm --save install recursive-install --legacy-peer-deps
RUN npm test
RUN npm run build
RUN npm prune --production --legacy-peer-deps

# Step 2: Packages assets for serving
FROM node:16-alpine AS serve

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /centraldashboard .

EXPOSE 8082
ENTRYPOINT ["npm", "start"]
