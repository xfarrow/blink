-- Table: public.ActivationLink

-- DROP TABLE IF EXISTS public."ActivationLink";

CREATE TABLE IF NOT EXISTS public."ActivationLink"
(
    identifier character varying COLLATE pg_catalog."default" NOT NULL,
    person_id integer NOT NULL,
    CONSTRAINT "ActivationLink_pkey" PRIMARY KEY (identifier),
    CONSTRAINT "PersonActivationLinkFK" FOREIGN KEY (person_id)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."ActivationLink"
    OWNER to pg_database_owner;