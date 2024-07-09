#!/bin/bash

# add-column.sqlを実行
PGPASSWORD="${POSTGRES_PASSWORD}" psql -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -f /home/postgrescli/scripts/add-column.sql
