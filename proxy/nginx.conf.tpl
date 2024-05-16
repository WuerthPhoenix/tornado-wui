worker_processes 1;

events { worker_connections 1024; }

http {
    sendfile on;

    upstream tornado-ui {
        server ui;
    }

    upstream user {
        server backend-user;
    }

    upstream tornado {
        server backend-tornado:4748;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://tornado-ui;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /user {
           proxy_pass http://user;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ~* ^/backend/api/(.*)$ {
           set $backend_path $1;
           rewrite ^/(.+)/$ /$1;
           proxy_pass http://tornado/api/$backend_path;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header Authorization "Bearer ${AUTH_TOKEN}";
        }
    }
}