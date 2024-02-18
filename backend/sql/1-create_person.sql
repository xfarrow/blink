-- Table: public.Person

-- DROP TABLE IF EXISTS public."Person";

CREATE TABLE IF NOT EXISTS public."Person"
(
    id SERIAL PRIMARY KEY,
    email character varying(128) NOT NULL UNIQUE,
    password character varying(128) NOT NULL,
    display_name character varying(128) NOT NULL,
    date_of_birth date,
    available boolean,
    enabled boolean NOT NULL DEFAULT false,
    place_of_living character varying(128)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Person"
    OWNER to pg_database_owner;