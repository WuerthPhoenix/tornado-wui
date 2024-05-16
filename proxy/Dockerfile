# Use the official Nginx image
FROM nginx:alpine

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf.tpl /etc/nginx/nginx.conf.tpl

# Generate auth token
COPY generate_auth_token.sh /generate_auth_token.sh
RUN AUTH_TOKEN=$(/bin/sh /generate_auth_token.sh) && \
    echo $AUTH_TOKEN && \
    sed -i "s/\${AUTH_TOKEN}/$AUTH_TOKEN/g" /etc/nginx/nginx.conf.tpl && \
    mv /etc/nginx/nginx.conf.tpl /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]