-- Table: public.OrganizationPost

-- DROP TABLE IF EXISTS public."OrganizationPost";

CREATE TABLE IF NOT EXISTS public."OrganizationPost"
(
    id SERIAL PRIMARY KEY,
    organization_id integer NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    original_author integer NOT NULL,
    CONSTRAINT "OrganizationPost_pkey" PRIMARY KEY (id),
    CONSTRAINT "AuthorIdFK" FOREIGN KEY (original_author)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "OrganizationIdFk" FOREIGN KEY (organization_id)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."OrganizationPost"
    OWNER to postgres;