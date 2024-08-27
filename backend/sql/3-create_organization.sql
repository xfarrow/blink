    -- Table: Organization

    -- DROP TABLE IF EXISTS "Organization";

    CREATE TABLE IF NOT EXISTS "Organization"
    (
        id SERIAL PRIMARY KEY,
        name character varying(128) NOT NULL,
        location character varying,
        description text
    )