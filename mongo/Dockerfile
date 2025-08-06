# Dockerfile to fix CRITICAL vulnerabilities in gosu
# Based on mongo:8.0.12 but builds gosu with Go 1.22.4

FROM mongo:8.0.12

# Install required packages and Go 1.22.4
RUN apt-get update && apt-get install -y \
    wget \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN wget -O /tmp/go.tar.gz "https://go.dev/dl/go1.22.4.linux-amd64.tar.gz" && \
    tar -C /usr/local -xzf /tmp/go.tar.gz && \
    rm /tmp/go.tar.gz

ENV PATH="/usr/local/go/bin:${PATH}"

# Build gosu from source with Go 1.22.4
RUN git clone https://github.com/tianon/gosu.git /tmp/gosu && \
    cd /tmp/gosu && \
    go build -o /usr/local/bin/gosu . && \
    chmod +x /usr/local/bin/gosu && \
    rm -rf /tmp/gosu
