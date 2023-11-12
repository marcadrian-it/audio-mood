FROM node:20-bookworm-slim

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y \
        bash git make wget g++ ffmpeg

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
USER node

RUN git clone https://github.com/ggerganov/whisper.cpp.git src/whisper.cpp

COPY --chown=node:node . .
RUN npm install && npm run build

WORKDIR /home/node/app/src/whisper.cpp
RUN bash ./models/download-ggml-model.sh tiny.en
RUN make && chmod +x main && ldd main
WORKDIR /home/node/app

EXPOSE 3010
CMD [ "node", "src/index.js" ]
