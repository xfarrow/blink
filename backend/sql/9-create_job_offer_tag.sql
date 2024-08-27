-- Table: JobOfferTag
-- This table allows to create a N-to-N map between Tag and JobOffer

-- DROP TABLE IF EXISTS "JobOfferTag";

CREATE TABLE IF NOT EXISTS "JobOfferTag"
(
    id serial,
    job_offer_id integer NOT NULL,
    tag_id integer NOT NULL,
    CONSTRAINT "JobOfferTag_pkey" PRIMARY KEY (id),
    CONSTRAINT "JobOfferFk" FOREIGN KEY (job_offer_id)
        REFERENCES "JobOffer" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT "TagFk" FOREIGN KEY (tag_id)
        REFERENCES "Tag" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)