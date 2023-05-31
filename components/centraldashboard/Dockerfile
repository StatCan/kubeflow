# Step 1: Builds and tests
# This is a long-lived tag, if there is a vulnerability
# sometimes a rebuild will set you on your way.
FROM node:16-alpine AS build

ARG kubeflowversion
ARG commit
ENV BUILD_VERSION=$kubeflowversion
ENV BUILD_COMMIT=$commit
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt update -qq && apt install -qq -y gnulib

COPY . /centraldashboard
WORKDIR /centraldashboard

RUN BUILDARCH="$(dpkg --print-architecture)" &&  npm rebuild && \
    if [ "$BUILDARCH" = "arm64" ]  ||  \
    [ "$BUILDARCH" = "armhf" ]; then \
    export CFLAGS=-Wno-error && \
    export CXXFLAGS=-Wno-error;  \
    fi && \
    npm install && \
    npm run build && \
    npm prune --production

# Step 2: Packages assets for serving
FROM node:16-alpine AS serve

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /centraldashboard .

EXPOSE 8082
ENTRYPOINT ["npm", "start"]
