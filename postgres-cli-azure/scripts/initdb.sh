#!/bin/bash

if [ -n "${POSTGRES_HOST}" ]; then
  export PGHOST="${POSTGRES_HOST}"
fi

if [ -n "${POSTGRES_USER}" ]; then
  export PGUSER="${POSTGRES_USER}"
fi

if [ -n "${POSTGRES_PORT}" ]; then
  export PGPORT="${POSTGRES_PORT}"
fi

if [ -n "${POSTGRES_DB}" ]; then
  export PGDATABASE="${POSTGRES_DB}"
fi

if [ -n "${POSTGRES_PASSWORD}" ]; then
  export PGPASSWORD="${POSTGRES_PASSWORD}"
fi

# Initialize database
psql -f /opt/init.sql
psql -f /opt/add-column.sql
