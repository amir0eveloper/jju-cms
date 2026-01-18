-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "enrollmentKey" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxStudents" INTEGER,
ADD COLUMN     "startDate" TIMESTAMP(3);
