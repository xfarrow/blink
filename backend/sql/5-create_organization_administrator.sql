-- Table: OrganizationAdministrator

-- DROP TABLE IF EXISTS "OrganizationAdministrator";

CREATE TABLE IF NOT EXISTS "OrganizationAdministrator"
(
    id_person integer NOT NULL,
    id_organization integer NOT NULL,
    CONSTRAINT "OrganizationAdministrator_pkey" PRIMARY KEY (id_organization, id_person),
    CONSTRAINT "OrganizationAdministratorOrganizationId" FOREIGN KEY (id_organization)
        REFERENCES "Organization" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    CONSTRAINT "OrganizationAdministratorUserId" FOREIGN KEY (id_person)
        REFERENCES "Person" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)