FROM node:alpine
WORKDIR /usr/src
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
ENV HOST=0.0.0.0 PORT=3003 NODE_ENV=production
EXPOSE $PORT
CMD ["node", "dist/server/entry.mjs"]
