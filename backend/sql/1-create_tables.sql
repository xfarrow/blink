-- Table: Person
CREATE TABLE IF NOT EXISTS "Person" (
  id SERIAL PRIMARY KEY, 
  email character varying(128) NOT NULL UNIQUE, 
  -- Primary e-mail
  password character varying(128) NOT NULL, 
  display_name character varying(128) NOT NULL, 
  date_of_birth date, 
  available boolean, 
  -- Whether this person is available to be hired
  enabled boolean NOT NULL DEFAULT false, 
  -- Whether this profile is active
  place_of_living character varying(128), 
  about_me character varying(4096), 
  qualification character varying(64)
);

-- Table: ActivationLink
CREATE TABLE IF NOT EXISTS "ActivationLink" (
  identifier character varying PRIMARY KEY, 
  person_id integer NOT NULL, 
  CONSTRAINT "PersonActivationLinkFK" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: Organization
CREATE TABLE IF NOT EXISTS "Organization" (
  id SERIAL PRIMARY KEY, 
  name character varying(128) NOT NULL, 
  location character varying, 
  description text
);

-- Table: OrganizationPost
CREATE TABLE IF NOT EXISTS "OrganizationPost" (
  id SERIAL PRIMARY KEY, 
  organization_id integer NOT NULL, 
  content text NOT NULL, 
  created_at timestamp without time zone DEFAULT now(), 
  original_author integer NOT NULL, 
  CONSTRAINT "AuthorIdFK" FOREIGN KEY (original_author) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE NOT VALID, 
  CONSTRAINT "OrganizationIdFk" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE NOT VALID
);

-- Table: OrganizationAdministrator
CREATE TABLE IF NOT EXISTS "OrganizationAdministrator" (
  id_person integer NOT NULL, 
  id_organization integer NOT NULL, 
  CONSTRAINT "OrganizationAdministrator_pkey" PRIMARY KEY (id_organization, id_person), 
  CONSTRAINT "OrganizationAdministratorOrganizationId" FOREIGN KEY (id_organization) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE NOT VALID, 
  CONSTRAINT "OrganizationAdministratorUserId" FOREIGN KEY (id_person) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Table: Message
CREATE TABLE IF NOT EXISTS "Message" (
  id serial NOT NULL, 
  person_id integer NOT NULL, 
  organization_id integer NOT NULL, 
  author_on_behalf_of_organization integer, 
  "timestamp" timestamp without time zone NOT NULL, 
  content character varying(4096) NOT NULL, 
  sender_type character varying(12) NOT NULL, 
  CONSTRAINT "Message_pkey" PRIMARY KEY (id), 
  CONSTRAINT "Message_author_on_behalf_of_company_fkey" FOREIGN KEY (
    author_on_behalf_of_organization
  ) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, 
  CONSTRAINT "Message_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, 
  CONSTRAINT "Message_person_id_fkey" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE, 
  CONSTRAINT "Message_sender_type_check" CHECK (
    sender_type :: text = 'ORGANIZATION' :: text 
    OR sender_type :: text = 'PERSON' :: text
  ), 
  CONSTRAINT "Message_sender_constraint" CHECK (
    author_on_behalf_of_organization IS NULL 
    AND sender_type :: text = 'PERSON' :: text 
    OR author_on_behalf_of_organization IS NOT NULL 
    AND sender_type :: text = 'ORGANIZATION' :: text
  )
);
COMMENT ON COLUMN "Message".sender_type IS 'sender_type can be either be PERSON or ORGANIZATION, depending who''s sending the message. It is PERSON if and only if author_on_behalf_of_organization is NULL. It is ORGANIZATION if and only if author_on_behalf_of_organization is NOT NULL. This column may seem redundant if we already know how to identify a sender, but it does give more clarity to the API implementers';
COMMENT ON CONSTRAINT "Message_sender_type_check" ON "Message" IS 'We want the sender to be either PERSON or ORGANIZATION';
COMMENT ON CONSTRAINT "Message_sender_constraint" ON "Message" IS 'If ''author_on_behalf_of_organization'' is NULL, then the sender is a person, instead, if ''author_on_behalf_of_organization'' is not NULL, the sender is a organization';

-- Table: Tag
CREATE TABLE IF NOT EXISTS "Tag" (
  id SERIAL, 
  tag character varying(256) NOT NULL, 
  CONSTRAINT "Tag_pkey" PRIMARY KEY (id)
);

-- Table: JobOffer
CREATE TABLE IF NOT EXISTS "JobOffer" (
  id SERIAL, 
  title character varying(2048) NOT NULL, 
  description character varying(4096), 
  requirements character varying(4096), 
  salary money NOT NULL, 
  salary_frequency character varying(64) NOT NULL, 
  salary_currency character varying(64) NOT NULL, 
  location character varying(256), 
  organization_id integer, 
  CONSTRAINT "JobOffer_pkey" PRIMARY KEY (id), 
  CONSTRAINT "OrganizationFK" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE NOT VALID
);

-- Table: JobOfferTag
-- This table allows to create a N-to-N map between Tag and JobOffer
CREATE TABLE IF NOT EXISTS "JobOfferTag" (
  id serial, 
  job_offer_id integer NOT NULL, 
  tag_id integer NOT NULL, 
  CONSTRAINT "JobOfferTag_pkey" PRIMARY KEY (id), 
  CONSTRAINT "JobOfferFk" FOREIGN KEY (job_offer_id) REFERENCES "JobOffer" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE, 
  CONSTRAINT "TagFk" FOREIGN KEY (tag_id) REFERENCES "Tag" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: RequestResetPassword
CREATE TABLE IF NOT EXISTS "RequestResetPassword" (
  id serial, 
  email character varying(128) NOT NULL, 
  secret character varying NOT NULL, 
  time_of_request timestamp without time zone NOT NULL DEFAULT now(), 
  CONSTRAINT "RequestResetPassword_pkey" PRIMARY KEY (id)
);

-- Table: Experience
CREATE TABLE IF NOT EXISTS "Experience" (
  id serial, 
  title character varying(128) NOT NULL, 
  description text NOT NULL, 
  organization character varying(128) NOT NULL, 
  date daterange NOT NULL, 
  organization_id integer, 
  person_id integer NOT NULL, 
  type character varying(32) NOT NULL, 
  CONSTRAINT "Experience_pkey" PRIMARY KEY (id), 
  CONSTRAINT "OrganizationFk" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE 
  SET 
    NULL,
    CONSTRAINT "PersonFk" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);
