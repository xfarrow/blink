-- Table: public.OrganizationAdministrator

-- DROP TABLE IF EXISTS public."OrganizationAdministrator";

CREATE TABLE IF NOT EXISTS public."OrganizationAdministrator"
(
    id_person integer NOT NULL,
    id_organization integer NOT NULL,
    CONSTRAINT "OrganizationAdministrator_pkey" PRIMARY KEY (id_organization, id_person),
    CONSTRAINT "OrganizationAdministratorOrganizationId" FOREIGN KEY (id_organization)
        REFERENCES public."Organization" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "OrganizationAdministratorUserId" FOREIGN KEY (id_person)
        REFERENCES public."Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."OrganizationAdministrator"
    OWNER to pg_database_owner;