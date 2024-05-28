# Use the rust container during the build step
FROM rust:1.71.1-slim-bullseye as builder

# Create the working directory for the container
WORKDIR /usr/src/tornado

COPY tornado .

# Compile tornado in release mode
RUN cargo build --release

# Create a new, lighter image for the execution.
FROM debian:bullseye-slim

# Copy the binary and config files from the build container into the final container.
COPY --from=builder /usr/src/tornado/target/release/tornado_engine /usr/local/bin/tornado
COPY --from=builder /usr/src/tornado/tornado/engine/config/ /etc/tornado/

EXPOSE 4748

# Execute tornado in the container
CMD ["tornado", "daemon"]