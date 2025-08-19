# Dockerfile to address CRITICAL vulnerabilities in fiware/orion:4.2.0
# Base: fiware/orion:4.2.0 (Debian 12.10)
# Target: Debian 12.11 with security updates

FROM fiware/orion:4.2.0

USER root

# Update packages, apply security updates, and cleanup in a single layer
RUN set -eux; \
    # Save the list of packages before modifications
    saved_pkgs_file="/tmp/pkgs.before"; \
    dpkg-query -W -f='${Package}\n' | sort > "${saved_pkgs_file}"; \
    \
    # Update packages and apply security updates
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl; \
    apt-get upgrade -y; \
    apt-get dist-upgrade -y; \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*; \
    \
    # Cleanup build artifacts and temporary packages
    cd /; \
    current_pkgs_file="/tmp/pkgs.after"; \
    dpkg-query -W -f='${Package}\n' | sort > "${current_pkgs_file}"; \
    # Extract packages that exist in 'after' but not in 'before' (i.e., newly added)
    to_remove="$(comm -13 "${saved_pkgs_file}" "${current_pkgs_file}" \
        | grep -E '^(ca-certificates|curl)$' || true)"; \
    if [ -n "${to_remove}" ]; then \
        apt-get purge -y --auto-remove ${to_remove}; \
    fi; \
    rm -f "${saved_pkgs_file}" "${current_pkgs_file}"; \
    rm -rf /var/lib/apt/lists/*; \
    \
    # Clean up temporary files
    rm -rf /tmp/*

USER nobody
