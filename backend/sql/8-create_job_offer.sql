-- Table: JobOffer

-- DROP TABLE IF EXISTS "JobOffer";

CREATE TABLE IF NOT EXISTS "JobOffer"
(
    id SERIAL,
    title character varying(2048) NOT NULL,
    description character varying(4096),
    requirements character varying(4096),
    salary money NOT NULL,
    salary_frequency character varying(64) NOT NULL,
    salary_currency character varying(64) NOT NULL,
    location character varying(256),
    organization_id integer,
    CONSTRAINT "JobOffer_pkey" PRIMARY KEY (id),
    CONSTRAINT "OrganizationFK" FOREIGN KEY (organization_id)
        REFERENCES "Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)