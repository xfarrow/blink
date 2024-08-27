-- Table: ActivationLink

-- DROP TABLE IF EXISTS "ActivationLink";

CREATE TABLE IF NOT EXISTS "ActivationLink"
(
    identifier character varying PRIMARY KEY,
    person_id integer NOT NULL,
    CONSTRAINT "PersonActivationLinkFK" FOREIGN KEY (person_id)
        REFERENCES "Person" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)