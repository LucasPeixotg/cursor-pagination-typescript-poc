FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build


FROM node:24-alpine AS development

WORKDIR /app

ENV NODE_ENV=development

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY nodemon.json ./
COPY src/ ./src/

EXPOSE 8080

CMD ["npm", "run", "dev"]


FROM node:24-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
