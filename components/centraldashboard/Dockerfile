# Step 1: Builds and tests
FROM node:16-alpine3.16 AS build

ARG kubeflowversion
ARG commit
ENV BUILD_VERSION=$kubeflowversion
ENV BUILD_COMMIT=$commit
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update && apk upgrade

RUN apk add --no-cache \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++ \
    git \
    coreutils

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12

# Install nvm with node and npm
RUN git clone https://github.com/nvm-sh/nvm.git $NVM_DIR \
    && . $NVM_DIR/nvm.sh \
    && nvm install --no-progress $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

COPY . /centraldashboard
WORKDIR /centraldashboard

RUN . $NVM_DIR/nvm.sh && \
    nvm use $NODE_VERSION && \ 
    npm rebuild && \
    if [ "$(uname -m)" = "aarch64" ]; then \
        export CFLAGS=-Wno-error && \
        export CXXFLAGS=-Wno-error && \
        npm install; \
    else \
        npm install; \
    fi && \
    npm test && \
    npm run build && \
    npm prune --production

# Step 2: Packages assets for serving
FROM node:16-alpine3.16 AS serve

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /centraldashboard .

RUN apk add --no-cache \
    bash \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont \
    libstdc++ \
    git \
    coreutils

ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 12

# Install nvm with node and npm
RUN git clone https://github.com/nvm-sh/nvm.git $NVM_DIR \
    && . $NVM_DIR/nvm.sh \
    && nvm install --no-progress $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

EXPOSE 8082
ENTRYPOINT ["/usr/local/nvm/versions/node/v12.22.12/bin/npm", "start"]
