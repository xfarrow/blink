-- Table: public.JobOffer

-- DROP TABLE IF EXISTS public."JobOffer";

CREATE TABLE IF NOT EXISTS public."JobOffer"
(
    id SERIAL,
    title character varying(2048) NOT NULL,
    description character varying(4096),
    requirements character varying(4096),
    salary money NOT NULL,
    salary_frequency character varying(64) NOT NULL,
    location character varying(256),
    organization_id integer,
    CONSTRAINT "JobOffer_pkey" PRIMARY KEY (id),
    CONSTRAINT "OrganizationFK" FOREIGN KEY (organization_id)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."JobOffer"
    OWNER to postgres;