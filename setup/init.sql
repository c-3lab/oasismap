-- init.sql

CREATE DATABASE cygnus;

\c cygnus;

CREATE SCHEMA IF NOT EXISTS goverment;

CREATE TABLE IF NOT EXISTS goverment.happiness (
    entityId char(36) PRIMARY KEY,
    entityType text NOT NULL,
    fiwareServicePath text NOT NULL,
    recvTime timestamp,
    happiness1 smallint NOT NULL,
    happiness1_md text,
    happiness2 smallint NOT NULL,
    happiness2_md text,
    happiness3 smallint NOT NULL,
    happiness3_md text,
    happiness4 smallint NOT NULL,
    happiness4_md text,
    happiness5 smallint NOT NULL,
    happiness5_md text,
    happiness6 smallint NOT NULL,
    happiness6_md text,
    timestamp timestamp NOT NULL,
    timestamp_md text,
    nickname text NOT NULL,
    nickname_md text,
    location text NOT NULL,
    location_md text,
    age varchar(10) NOT NULL,
    age_md text,
    address varchar(50) NOT NULL,
    address_md text
);
