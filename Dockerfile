FROM alpine as base
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v13.5.0 works with Chromium 100.
RUN yarn add puppeteer@13.5.0

# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser
WORKDIR /service

FROM base as dependencies
COPY package.json yarn.lock tsconfig.json ./
RUN yarn --pure-lockfile --production true

FROM dependencies as build
RUN yarn --pure-lockfile --production false
COPY src ./src

RUN yarn build

FROM base as release
COPY --from=dependencies /service/node_modules ./node_modules
COPY --from=dependencies /service/package.json ./package.json
COPY --from=build /service/dist ./dist

ENV NODE_ENV=production

CMD [ "node", "dist/index.js" ]