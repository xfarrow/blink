-- Table: OrganizationPost

-- DROP TABLE IF EXISTS "OrganizationPost";

CREATE TABLE IF NOT EXISTS "OrganizationPost"
(
    id SERIAL PRIMARY KEY,
    organization_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    original_author integer NOT NULL,
    CONSTRAINT "AuthorIdFK" FOREIGN KEY (original_author)
        REFERENCES "Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "OrganizationIdFk" FOREIGN KEY (organization_id)
        REFERENCES "Organization" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT VALID
)