FROM node:20.15-alpine3.20 as develop

# Create app directory
WORKDIR /app

COPY ["package*.json", "./"]
COPY prisma ./prisma/

# Install app dependencies
RUN apk update && apk upgrade && apk add --no-cache bash git openssh
#Establecer Zona horaria
ENV TZ=America/Santiago
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

RUN npm install -g @nestjs/cli
RUN npm install --save --legacy-peer-deps rimraf
RUN npm install

RUN npm ci

COPY . .

RUN npm run build

FROM node:20.15-alpine3.20 as production
#Establecer Zona horaria
ENV TZ=America/Santiago
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

COPY --from=develop /app/dist ./dist
COPY --from=develop /app/node_modules ./node_modules
COPY --from=develop /app/prisma ./prisma
COPY --from=develop /app/package*.json ./
COPY --from=develop /app/tsconfig.build.json ./
COPY --from=develop /app/tsconfig.json ./

# CMD [ "npm", "run", "start:prod" ]
EXPOSE 3000

CMD [ "npm", "run", "start:prod" ]
