-- Table: Person

-- DROP TABLE IF EXISTS "Person";

CREATE TABLE IF NOT EXISTS "Person"
(
    id SERIAL PRIMARY KEY,
    email character varying(128) NOT NULL UNIQUE, -- Primary e-mail
    password character varying(128) NOT NULL,
    display_name character varying(128) NOT NULL,
    date_of_birth date,
    available boolean, -- Whether this person is available to be hired
    enabled boolean NOT NULL DEFAULT false, -- Whether this profile is active
    place_of_living character varying(128),
    about_me character varying(4096),
    qualification character varying(64)
)