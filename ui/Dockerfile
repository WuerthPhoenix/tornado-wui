# Use the official lightweight Node.js 14 image
FROM node:14 as build-stage

# Set working directory
WORKDIR /app

# Install rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs  | sh -s -- -y

# Export rust bin path
ENV PATH="/root/.cargo/bin:${PATH}"

# Install rust-wasm
RUN cargo install wasm-pack

COPY tornado ./tornado

WORKDIR /app/tornado/tornado-input-validation


RUN wasm-pack build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy local code to the container image
COPY . .

# Build Vue app
RUN npm run build

# Production stage
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]