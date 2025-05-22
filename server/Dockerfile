FROM node:22

WORKDIR /app

# SSL certificate
RUN apt-get update && apt-get install -y openssl
RUN mkdir -p /etc/ssl/private /etc/ssl/certs && \
	openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
	-keyout /etc/ssl/private/server.key \
	-out /etc/ssl/certs/server.crt \
	-subj "/C=FR/ST=IDF/L=Paris/O=42/CN=kingpong.42.fr"

COPY package*.json ./
# wsl fix
RUN npm config set strict-ssl false
RUN npm install --verbose

# Add all our files except node_modules from .dockerignore
COPY . .

EXPOSE ${PORT}

CMD ["npm", "run", "start"]
