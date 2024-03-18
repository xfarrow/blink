-- Table: public.JobOfferTag
-- This table allows to create a N-to-N map between Tag and JobOffer

-- DROP TABLE IF EXISTS public."JobOfferTag";

CREATE TABLE IF NOT EXISTS public."JobOfferTag"
(
    id integer NOT NULL DEFAULT nextval('"JobOfferTag_id_seq"'::regclass),
    job_offer_id integer NOT NULL,
    tag_id integer NOT NULL,
    CONSTRAINT "JobOfferTag_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobOfferFk" FOREIGN KEY (job_offer_id)
        REFERENCES public."JobOffer" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "TagFk" FOREIGN KEY (tag_id)
        REFERENCES public."Tag" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."JobOfferTag"
    OWNER to postgres;