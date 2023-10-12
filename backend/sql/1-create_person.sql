-- Table: public.Person

-- DROP TABLE IF EXISTS public."Person";

CREATE TABLE IF NOT EXISTS public."Person"
(
    id integer NOT NULL DEFAULT nextval('"Person_id_seq"'::regclass),
    email character varying(128) COLLATE pg_catalog."default" NOT NULL,
    password character varying(128) COLLATE pg_catalog."default" NOT NULL,
    display_name character varying(128) COLLATE pg_catalog."default" NOT NULL,
    date_of_birth date,
    available boolean,
    enabled boolean NOT NULL DEFAULT false,
    place_of_living character varying(128) COLLATE pg_catalog."default",
    CONSTRAINT "Person_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Person"
    OWNER to pg_database_owner;