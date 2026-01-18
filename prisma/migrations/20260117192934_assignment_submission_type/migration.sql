-- CreateEnum
CREATE TYPE "SubmissionType" AS ENUM ('ONLINE_TEXT', 'FILE_UPLOAD', 'BOTH', 'NONE');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "submissionType" "SubmissionType" NOT NULL DEFAULT 'BOTH';
