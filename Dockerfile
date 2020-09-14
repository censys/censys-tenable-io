
FROM node:12

WORKDIR /opt/censys/tenable-io

COPY package*.json ./

RUN npm install -s

COPY . .

# EXPOSE 8080

CMD ["node", "docker.js"]
