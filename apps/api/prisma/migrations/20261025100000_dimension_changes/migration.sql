-- Stage 0 dimension changes (content/research/stage-0.md § Answer mapping, § Owner approval).
-- Rows are mapped in each USING clause, before the old enum type is dropped.
-- Type names are unqualified so the mapping test can replay this file on a throwaway schema.

-- AlterEnum
ALTER TYPE "FamilySituation" ADD VALUE 'SOLE_PARENT';

-- AlterEnum
BEGIN;
CREATE TYPE "Occupation_new" AS ENUM ('HEALTHCARE', 'EDUCATION', 'TRADES', 'OTHER_PROFESSIONAL', 'SEEKING_WORK');
ALTER TABLE "UserProfile" ALTER COLUMN "occupation" TYPE "Occupation_new" USING (
  CASE "occupation"::text
    WHEN 'TECHNOLOGY' THEN 'OTHER_PROFESSIONAL'
    WHEN 'FINANCE' THEN 'OTHER_PROFESSIONAL'
    ELSE "occupation"::text
  END::"Occupation_new"
);
ALTER TYPE "Occupation" RENAME TO "Occupation_old";
ALTER TYPE "Occupation_new" RENAME TO "Occupation";
DROP TYPE "Occupation_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VisaType_new" AS ENUM ('AEWV', 'STRAIGHT_TO_RESIDENCE', 'SKILLED_MIGRANT_RESIDENT', 'PARTNER_WORK', 'POST_STUDY_WORK', 'SPECIFIC_PURPOSE_WORK', 'WORKING_HOLIDAY', 'OTHER');
ALTER TABLE "UserProfile" ALTER COLUMN "visaType" TYPE "VisaType_new" USING (
  CASE "visaType"::text
    WHEN 'GREEN_LIST_WORK' THEN 'AEWV'
    WHEN 'GREEN_LIST_RESIDENCE' THEN 'STRAIGHT_TO_RESIDENCE'
    WHEN 'PARTNER_OF_STUDENT' THEN 'PARTNER_WORK'
    ELSE "visaType"::text
  END::"VisaType_new"
);
ALTER TYPE "VisaType" RENAME TO "VisaType_old";
ALTER TYPE "VisaType_new" RENAME TO "VisaType";
DROP TYPE "VisaType_old";
COMMIT;
