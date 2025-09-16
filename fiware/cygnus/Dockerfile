# Security updates for fiware/cygnus-ngsi:3.16.0

FROM fiware/cygnus-ngsi:3.16.0

USER root

# Update packages, apply security updates, and cleanup in a single layer
RUN set -eux; \
    # Save package list before modifications for cleanup tracking \
    saved_pkgs_file="/tmp/pkgs.before"; \
    dpkg-query -W -f='${Package}\n' | sort > "${saved_pkgs_file}"; \
    \
    # Update package lists and install essential tools \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg2; \
    \
    # Apply security updates for vulnerable packages \
    apt-get upgrade -y \
        libsqlite3-0 \
        libxml2 \
        zlib1g; \
    \
    # Full system upgrade to get latest security patches \
    apt-get upgrade -y; \
    apt-get dist-upgrade -y; \
    \
    # Clean up package manager \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*; \
    \
    # Remove temporary packages that were only needed for updates \
    cd /; \
    current_pkgs_file="/tmp/pkgs.after"; \
    dpkg-query -W -f='${Package}\n' | sort > "${current_pkgs_file}"; \
    to_remove="$(comm -13 "${saved_pkgs_file}" "${current_pkgs_file}" \
        | grep -E '^(ca-certificates|curl|gnupg2)$' || true)"; \
    if [ -n "${to_remove}" ]; then \
        apt-get update; \
        apt-get purge -y --auto-remove ${to_remove}; \
        apt-get clean; \
        rm -rf /var/lib/apt/lists/*; \
    fi; \
    rm -f "${saved_pkgs_file}" "${current_pkgs_file}"; \
    \
    # Clean up temporary files and caches \
    rm -rf /tmp/* /var/tmp/* /root/.cache
