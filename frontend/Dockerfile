FROM node:18-alpine
RUN corepack enable
RUN corepack prepare pnpm@7.18.0 --activate
WORKDIR /home/node
COPY package.json ./
RUN pnpm install
COPY . .
CMD pnpm run dev
