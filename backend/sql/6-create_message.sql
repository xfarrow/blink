-- Table: public.Message

-- DROP TABLE IF EXISTS public."Message";

CREATE TABLE IF NOT EXISTS public."Message"
(
    id serial NOT NULL,
    person_id integer NOT NULL,
    organization_id integer NOT NULL,
    author_on_behalf_of_organization integer,
    "timestamp" timestamp without time zone NOT NULL,
    content character varying(4096) NOT NULL,
    sender_type character varying(12) NOT NULL,
    CONSTRAINT "Message_pkey" PRIMARY KEY (id),
    CONSTRAINT "Message_author_on_behalf_of_company_fkey" FOREIGN KEY (author_on_behalf_of_organization)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "Message_organization_id_fkey" FOREIGN KEY (organization_id)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "Message_person_id_fkey" FOREIGN KEY (person_id)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT "Message_sender_type_check" CHECK (sender_type::text = 'ORGANIZATION'::text OR sender_type::text = 'PERSON'::text),
    CONSTRAINT "Message_sender_constraint" CHECK (author_on_behalf_of_organization IS NULL AND sender_type::text = 'PERSON'::text OR author_on_behalf_of_organization IS NOT NULL AND sender_type::text = 'ORGANIZATION'::text)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Message"
    OWNER to postgres;

COMMENT ON COLUMN public."Message".sender_type
    IS 'sender_type can be either be PERSON or ORGANIZATION, depending who''s sending the message. It is PERSON if and only if author_on_behalf_of_organization is NULL. It is ORGANIZATION if and only if author_on_behalf_of_organization is NOT NULL. This column may seem redundant if we already know how to identify a sender, but it does give more clarity to the API implementers';

COMMENT ON CONSTRAINT "Message_sender_type_check" ON public."Message"
    IS 'We want the sender to be either PERSON or ORGANIZATION';
COMMENT ON CONSTRAINT "Message_sender_constraint" ON public."Message"
    IS 'If ''author_on_behalf_of_organization'' is NULL, then the sender is a person, instead, if ''author_on_behalf_of_organization'' is not NULL, the sender is a organization';