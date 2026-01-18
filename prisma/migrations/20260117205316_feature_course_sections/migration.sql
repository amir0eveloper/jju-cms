-- CreateTable
CREATE TABLE "_CourseToSection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToSection_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToSection_B_index" ON "_CourseToSection"("B");

-- AddForeignKey
ALTER TABLE "_CourseToSection" ADD CONSTRAINT "_CourseToSection_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseToSection" ADD CONSTRAINT "_CourseToSection_B_fkey" FOREIGN KEY ("B") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
