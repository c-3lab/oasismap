-- add-column.sql

\c oasismap_context_data;

-- 後方互換性を考慮
ALTER TABLE government.happiness
ADD COLUMN IF NOT EXISTS memo varchar(30),
ADD COLUMN IF NOT EXISTS memo_md text;
