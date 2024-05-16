# Usa un'immagine di Rust come base
FROM rust:1.71.1-slim-bullseye as builder

# Crea una directory di lavoro all'interno del container
WORKDIR /usr/src/tornado

COPY tornado .

# Compila il progetto Rust in modalità release
RUN cargo build --release

# Ora inizia un nuovo stage per creare un'immagine più leggera senza il toolchain di Rust
FROM debian:bullseye-slim
#
#RUN apt-get update && apt-get install -y \
#    libssl-dev \
#    && rm -rf /var/lib/apt/lists/*

# Copia il binario compilato dallo stage precedente nell'immagine finale
COPY --from=builder /usr/src/tornado/target/release/tornado_engine /usr/local/bin/tornado
COPY --from=builder /usr/src/tornado/tornado/engine/config/ /etc/tornado/
#COPY ./conf/tornado.toml /etc/tornado/tornado.toml

EXPOSE 4748
# Esegui il binario quando il container viene avviato
CMD ["tornado", "daemon"]