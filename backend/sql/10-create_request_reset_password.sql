-- Table: public.RequestResetPassword

-- DROP TABLE IF EXISTS public."RequestResetPassword";

CREATE TABLE IF NOT EXISTS public."RequestResetPassword"
(
    id serial,
    email character varying(128) NOT NULL,
    secret character varying NOT NULL,
    time_of_request timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT "RequestResetPassword_pkey" PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."RequestResetPassword"
    OWNER to postgres;