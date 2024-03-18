-- Table: public.Tag

-- DROP TABLE IF EXISTS public."Tag";

CREATE TABLE IF NOT EXISTS public."Tag"
(
    id SERIAL,
    tag character varying(256) NOT NULL,
    CONSTRAINT "Tag_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Tag"
    OWNER to postgres;