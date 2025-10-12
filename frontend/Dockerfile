from node:18-alpine

WORKDIR /app

COPY . .

COPY package.json package-lock.json ./

RUN npm install


EXPOSE 3000