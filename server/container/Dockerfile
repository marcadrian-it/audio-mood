# Stage 1: Build whisper.cpp
FROM node:20-bookworm-slim AS whisper-builder

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
    bash git make wget g++

WORKDIR /whisper

RUN git clone https://github.com/ggerganov/whisper.cpp.git . && \
    bash ./models/download-ggml-model.sh tiny.en && \
    make && chmod +x main

# Stage 2: Build Node.js application
FROM node:20-bookworm-slim AS node-builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 3: Final image
FROM node:20-bookworm-slim

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
    bash libgomp1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /home/node/app

COPY --from=node-builder /app/package*.json ./
COPY --from=whisper-builder /whisper/main /home/node/app/src/whisper.cpp/main
COPY --from=whisper-builder /whisper/models/ggml-tiny.en.bin /home/node/app/src/whisper.cpp/models/
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/node_modules ./node_modules

COPY src/config.json /home/node/app/dist/config.json

COPY healthcheck.js /home/node/app/healthcheck.js

USER node

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node /home/node/app/healthcheck.js


CMD ["node", "./dist/worker.js"]

