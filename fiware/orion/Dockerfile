# Dockerfile to address CRITICAL vulnerabilities in fiware/orion:4.3.0
# Base: fiware/orion:4.3.0 (Debian 12.13)
# Target: Debian 12.13 with security updates and vulnerable package fixes

FROM fiware/orion:4.3.0

USER root

# Update packages, apply security updates, and cleanup in a single layer
RUN set -eux; \
    # Save the list of packages before modifications
    saved_pkgs_file="/tmp/pkgs.before"; \
    dpkg-query -W -f='${Package}\n' | sort > "${saved_pkgs_file}"; \
    \
    # Update packages and apply security updates
    # Note: Security repository is already enabled in the base image
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl; \
    \
    # Apply security updates for vulnerable packages explicitly
    # Note: Some packages may not have fixes available yet in Debian 12.13
    apt-get upgrade -y \
        libc6 \
        libc-bin \
        libc-dev-bin \
        libc6-dev \
        libldap-2.5-0 \
        libldap-common || true; \
    \
    # Full system upgrade to get latest security patches
    apt-get upgrade -y; \
    apt-get dist-upgrade -y; \
    \
    # Remove development packages that are not needed in production
    # linux-libc-dev contains kernel headers and is not needed at runtime
    apt-get purge -y --auto-remove \
        linux-libc-dev \
        || true; \
    \
    # Clean up package manager
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
        apt-get update; \
        apt-get purge -y --auto-remove ${to_remove}; \
        apt-get clean; \
        rm -rf /var/lib/apt/lists/*; \
    fi; \
    rm -f "${saved_pkgs_file}" "${current_pkgs_file}"; \
    \
    # Clean up temporary files
    rm -rf /tmp/* /var/tmp/* /root/.cache

USER nobody
