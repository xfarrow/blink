    -- Table: Tag

    -- DROP TABLE IF EXISTS "Tag";

    CREATE TABLE IF NOT EXISTS "Tag"
    (
        id SERIAL,
        tag character varying(256) NOT NULL,
        CONSTRAINT "Tag_pkey" PRIMARY KEY (id)
    )