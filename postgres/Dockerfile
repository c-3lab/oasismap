# Dockerfile to fix CRITICAL vulnerabilities in gosu and system packages
# Based on FROM postgres:17.5 but builds gosu with Go 1.25.5 and updates vulnerable packages
# Go 1.25.5 fixes CVE-2025-58183 and CVE-2025-61729

FROM postgres:17.5

RUN set -eux; \
    # Save the list of packages that were originally installed (sorted for later diff)
    saved_pkgs_file="/tmp/pkgs.before"; \
    dpkg-query -W -f='${Package}\n' | sort > "${saved_pkgs_file}"; \
    \
    # Install minimal tools required for building (may or may not be present originally)
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl git build-essential; \
    \
    # --- Temporarily install Go 1.25.5 (amd64) ---
    cd /tmp; \
    curl -fsSLO "https://go.dev/dl/go1.25.5.linux-amd64.tar.gz"; \
    tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz; \
    export PATH="/usr/local/go/bin:$PATH"; \
    \
    # --- Build gosu v1.17 with Go 1.25.5 (static binary) ---
    mkdir -p /tmp/gosu-src; \
    curl -fsSL -o /tmp/gosu-src/gosu.tar.gz "https://github.com/tianon/gosu/archive/refs/tags/1.17.tar.gz"; \
    tar -C /tmp/gosu-src -xzf /tmp/gosu-src/gosu.tar.gz --strip-components=1; \
    cd /tmp/gosu-src; \
    go mod download; \
    CGO_ENABLED=0 go build -trimpath -buildvcs=false -ldflags="-s -w" -o /usr/local/bin/gosu .; \
    chmod +x /usr/local/bin/gosu; \
    /usr/local/bin/gosu --version; \
    \
    # --- Update vulnerable packages to fix security issues ---
    cd /; \
    # Add trixie (testing) repository for newer package versions (including SQLite 3.50.2+)
    echo "deb http://deb.debian.org/debian trixie main" > /etc/apt/sources.list.d/trixie.list; \
    # Update package lists and upgrade vulnerable packages
    apt-get update && apt-get upgrade -y; \
    # Install specific package versions from trixie if available
    apt-get install -y --no-install-recommends \
        libsqlite3-0/trixie \
        libgssapi-krb5-2/trixie \
        libk5crypto3/trixie \
        libkrb5-3/trixie \
        libkrb5support0/trixie \
        libxslt1.1/trixie || apt-get install -y libsqlite3-0; \
    \
    # --- Cleanup build artifacts and Go toolchain ---
    cd /; \
    \
    # Determine which packages were newly installed during this build and remove only those
    current_pkgs_file="/tmp/pkgs.after"; \
    dpkg-query -W -f='${Package}\n' | sort > "${current_pkgs_file}"; \
    # Extract packages that exist in 'after' but not in 'before' (i.e., newly added)
    to_remove="$(comm -13 "${saved_pkgs_file}" "${current_pkgs_file}" \
      | grep -E '^(git|build-essential|curl|ca-certificates)$' || true)"; \
    if [ -n "${to_remove}" ]; then \
      apt-get purge -y --auto-remove ${to_remove}; \
    fi; \
    rm -f "${saved_pkgs_file}" "${current_pkgs_file}"; \
    rm -rf /var/lib/apt/lists/*; \
    \
    # Now clean up Go toolchain and temp files
    rm -rf /usr/local/go /tmp/*
