# syntax=docker/dockerfile:1
FROM node:lts-bullseye as build

WORKDIR /app

# Delete the .env file if it exists
RUN if [ -f .env ]; then rm -f .env; fi

# Copy the .env.example file to .env
COPY .env.example .env

COPY package*.json ./

RUN --mount=type=secret,id=bitbucket_credentials \
    git config --global credential.helper '!f() { cat /run/secrets/bitbucket_credentials; }; f' && \
    git config --global url."https://bitbucket.org/".insteadOf "ssh://git@bitbucket.org/" && \
    npm ci; \
    status=$?; rm -f /root/.gitconfig; exit $status
COPY . .
RUN npm run build

# ----------------------------
# Run with nginx
# ----------------------------
FROM nginx:alpine
ADD ./config/default.conf /etc/nginx/conf.d/default.conf

# Create directory for .sh
RUN mkdir -p /var/www/app

# Copy the .sh file to the container and give it execution permissions
COPY ./config/entrypoint.sh /var/www/app/entrypoint.sh
RUN chmod +x /var/www/app/entrypoint.sh

# Copy the .env file from the build stage
COPY --from=build /app/.env /app

COPY --from=build /app/dist /var/www/app/

EXPOSE 80

# Command to run the replacement script and then start Nginx
CMD ["/bin/sh", "-c", "/var/www/app/entrypoint.sh && nginx -g 'daemon off;'"]
