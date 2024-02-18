-- Table: public.Organization

-- DROP TABLE IF EXISTS public."Organization";

CREATE TABLE IF NOT EXISTS public."Organization"
(
    id SERIAL PRIMARY KEY,
    name character varying(128) NOT NULL,
    location character varying,
    description text,
    is_hiring boolean
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Organization"
    OWNER to pg_database_owner;