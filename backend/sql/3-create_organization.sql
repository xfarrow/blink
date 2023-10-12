-- Table: public.Organization

-- DROP TABLE IF EXISTS public."Organization";

CREATE TABLE IF NOT EXISTS public."Organization"
(
    id SERIAL PRIMARY KEY,
    name character varying(128) COLLATE pg_catalog."default" NOT NULL,
    location character varying COLLATE pg_catalog."default",
    description text COLLATE pg_catalog."default",
    is_hiring boolean
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Organization"
    OWNER to pg_database_owner;