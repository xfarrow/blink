-- Table: public.Experience

-- DROP TABLE IF EXISTS public."Experience";

CREATE TABLE IF NOT EXISTS public."Experience"
(
    id serial,
    title character varying(128) NOT NULL,
    description text NOT NULL,
    organization character varying(128) NOT NULL,
    date daterange NOT NULL,
    organization_id integer,
    person_id integer NOT NULL,
    type character varying(32) NOT NULL,
    CONSTRAINT "Experience_pkey" PRIMARY KEY (id),
    CONSTRAINT "OrganizationFk" FOREIGN KEY (organization_id)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT "PersonFk" FOREIGN KEY (person_id)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Experience"
    OWNER to postgres;