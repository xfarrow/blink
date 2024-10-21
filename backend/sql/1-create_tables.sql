CREATE TYPE Visibility AS ENUM ('NOBODY', 'THIS_INSTANCE', 'EVERYONE');
CREATE TYPE SalaryCurrency as ENUM ('EUR', 'USD', 'GBP');
CREATE TYPE RemotePosition as ENUM ('YES', 'NO', 'NOT_SPECIFIED', 'PARTIALLY');
CREATE TYPE ContractType as ENUM ('FULL-TIME','PART-TIME','INTERNSHIP','CONTRACT','FREELANCE','TEMPORARY','SEASONAL','APPRENTICESHIP','VOLUNTEER','ZERO-HOURS','FIXED-TERM','CASUAL','PROBATIONARY','SECONDMENT','JOB-SHARING');
CREATE TYPE ExperienceType as ENUM ('EDUCATION', 'WORK', 'VOLOUNTEER');
CREATE TYPE SalaryFrequency as ENUM ('WEEKLY', 'YEARLY');
CREATE TYPE InfoType AS ENUM ('EMAIL', 'PHONE', 'WEBSITE', 'GIT', 'MASTODON', 'YOUTUBE', 'FACEBOOK', 'INSTAGRAM', 'OTHER');

-- Table: Person
CREATE TABLE IF NOT EXISTS "Person" (
  id SERIAL PRIMARY KEY, 
  email CHARACTER VARYING(128) NOT NULL UNIQUE, 
  password CHARACTER VARYING(128) NOT NULL, 
  display_name CHARACTER VARYING(128) NOT NULL, 
  date_of_birth date, 
  place_of_living CHARACTER VARYING(128), 
  about_me CHARACTER VARYING(4096), 
  qualification CHARACTER VARYING(64),
  open_to_work BOOLEAN, 
  enabled BOOLEAN NOT NULL DEFAULT false, 
  visibility Visibility NOT NULL
);

-- Table: ActivationLink
CREATE TABLE IF NOT EXISTS "ActivationLink" (
  identifier CHARACTER VARYING PRIMARY KEY, 
  person_id INTEGER NOT NULL, 
  CONSTRAINT "PersonActivationLinkFK" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: Organization
CREATE TABLE IF NOT EXISTS "Organization" (
  id SERIAL PRIMARY KEY, 
  name CHARACTER VARYING(128) NOT NULL, 
  location CHARACTER VARYING(256), 
  description CHARACTER VARYING(4096)
);

-- Table: OrganizationAdministrator
CREATE TABLE IF NOT EXISTS "OrganizationAdministrator" (
  id_person INTEGER NOT NULL, 
  id_organization INTEGER NOT NULL, 
  CONSTRAINT "OrganizationAdministrator_pkey" PRIMARY KEY (id_organization, id_person), 
  CONSTRAINT "OrganizationAdministratorOrganizationId" FOREIGN KEY (id_organization) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE NOT VALID, 
  CONSTRAINT "OrganizationAdministratorUserId" FOREIGN KEY (id_person) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);

-- Table: Tag
CREATE TABLE IF NOT EXISTS "Tag" (
  id SERIAL PRIMARY KEY, 
  tag CHARACTER VARYING(256) NOT NULL
);

-- Table: JobOffer
CREATE TABLE IF NOT EXISTS "JobOffer" (
  id SERIAL PRIMARY KEY, 
  organization_id INTEGER, 
  title CHARACTER VARYING(2048) NOT NULL, 
  description CHARACTER VARYING(4096), 
  salary int4range,
  salary_frequency SalaryFrequency,
  salary_currency SalaryCurrency,
  location CHARACTER VARYING(256), 
  remote RemotePosition NOT NULL,
  contract_type ContractType,
  CONSTRAINT "OrganizationFK" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE NOT VALID
);

-- Table: JobOfferTag
-- This table allows to create a N-to-N map between Tag and JobOffer
CREATE TABLE IF NOT EXISTS "JobOfferTag" (
  id SERIAL PRIMARY KEY, 
  job_offer_id INTEGER NOT NULL, 
  tag_id INTEGER NOT NULL, 
  CONSTRAINT "JobOfferFk" FOREIGN KEY (job_offer_id) REFERENCES "JobOffer" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE, 
  CONSTRAINT "TagFk" FOREIGN KEY (tag_id) REFERENCES "Tag" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: Applicant
CREATE TABLE IF NOT EXISTS "Applicant" (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL, 
  job_offer_id INTEGER NOT NULL, 
  CONSTRAINT "PersonFk" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "JobOfferFk" FOREIGN KEY (job_offer_id) REFERENCES "JobOffer" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: Skills
CREATE TABLE IF NOT EXISTS "Skill" (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL, 
  tag_id INTEGER NOT NULL, 
  CONSTRAINT "PersonFk" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "TagFk" FOREIGN KEY (tag_id) REFERENCES "Tag" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: RequestResetPassword
CREATE TABLE IF NOT EXISTS "RequestResetPassword" (
  id SERIAL, 
  email CHARACTER VARYING(128) NOT NULL, 
  secret CHARACTER VARYING NOT NULL, 
  time_of_request TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(), 
  CONSTRAINT "RequestResetPassword_pkey" PRIMARY KEY (id)
);

-- Table: Experience
CREATE TABLE IF NOT EXISTS "Experience" (
  id SERIAL PRIMARY KEY, 
  title CHARACTER VARYING(128) NOT NULL, 
  description TEXT NOT NULL, 
  organization CHARACTER VARYING(128) NOT NULL, 
  organization_id INTEGER, 
  date daterange NOT NULL, 
  person_id INTEGER NOT NULL, 
  type ExperienceType NOT NULL, 
  CONSTRAINT "OrganizationFk" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "PersonFk" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: Message
CREATE TABLE IF NOT EXISTS "Message" (
  id SERIAL PRIMARY KEY, 
  sender_id INTEGER NOT NULL,
  sender_organization_id INTEGER NOT NULL,
  receiver_id INTEGER,
  receiver_organization_id INTEGER,
  content CHARACTER VARYING(4096) NOT NULL,
  timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT "SenderFK" FOREIGN KEY (sender_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "ReceiverFK" FOREIGN KEY (receiver_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "OrganizationSender" FOREIGN KEY (sender_organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "OrganizationReceiver" FOREIGN KEY (receiver_organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: PersonContactInfo
CREATE TABLE IF NOT EXISTS "PersonContactInfo" (
  id SERIAL PRIMARY KEY,
  person_id INTEGER NOT NULL,
  info CHARACTER VARYING(128) NOT NULL,
  info_type InfoType NOT NULL,
  CONSTRAINT "PersonFK" FOREIGN KEY (person_id) REFERENCES "Person" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
);

-- Table: OrganizationContactInfo
CREATE TABLE IF NOT EXISTS "OrganizationContactInfo" (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL,
  info CHARACTER VARYING(128) NOT NULL,
  info_type InfoType NOT NULL,
  CONSTRAINT "OrganizationFK" FOREIGN KEY (organization_id) REFERENCES "Organization" (id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE
)
