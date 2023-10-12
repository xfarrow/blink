-- Table: public.OrganizationPost

-- DROP TABLE IF EXISTS public."OrganizationPost";

CREATE TABLE IF NOT EXISTS public."OrganizationPost"
(
    id integer NOT NULL DEFAULT nextval('"OrganizationPost_id_seq"'::regclass),
    organization_id integer NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "OrganizationPost_pkey" PRIMARY KEY (id),
    CONSTRAINT "OrganizationIdFk" FOREIGN KEY (organization_id)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."OrganizationPost"
    OWNER to postgres;