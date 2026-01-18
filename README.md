# Jigjiga University Class Management System (JJU CMS)

A robust and scalable university management platform designed to streamline academic operations, from hierarchy management to classroom attendance. Built with modern web technologies to ensure performance, security, and a seamless user experience.

---

## 🚀 Overview

**JJU CMS** acts as the central digital hub for academic administration. It connects administrators, teachers, students, and class managers in a unified ecosystem. The system handles complex academic structures (Colleges, Departments, Programs) and simplifies day-to-day tasks like grading, attendance tracking, and course material distribution.

### Core Value Propositions

- **Centralized Administration**: Manage the entire university structure from a single dashboard.
- **Smart Automation**: Auto-enroll students into courses based on their section assignments.
- **Real-time Tracking**: Instant updates on teacher attendance and class execution.
- **Role-Specific Portals**: Tailored interfaces for Admins, Teachers, Students, and Staff.

---

## 🛠️ Technical Architecture

The project is built on a type-safe, full-stack foundation:

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **Backend**: Next.js Server Actions (API-less architecture)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (for type-safe database access)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Session-based auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI + Tailwind)

---

## 👥 User Roles & Capabilities

### 1. Administrator (`Role.ADMIN`)

- **Academic Hierarchy**: Define and manage Colleges, Departments, Programs, Academic Years, Semesters, and Sections.
- **User Management**: Create, edit, and delete accounts for Staff and Students. Support for Bulk CSV Upload.
- **Course Management**: Create courses and assign them to Departments/Semesters and Teachers.
- **System Oversight**: View all data, easy access to all dashboards.

### 2. Teacher (`Role.TEACHER`)

- **My Courses**: View assigned courses.
- **Content Creation**: Add Learning Modules (Text, Files, Links) to courses.
- **Assessment**: Create Assignments, track submissions, and grade student work.
- **Attendance**: Mark student attendance for specific class sessions.

### 3. Student (`Role.STUDENT`)

- **Dashboard**: View enrolled courses and upcoming deadlines.
- **Learning**: Access course materials and modules.
- **Submissions**: Submit assignments (text or file upload).
- **History**: View own attendance records and grades.

### 4. Class Manager (`Role.CLASS_MANAGER`)

- **Class Monitoring**: dedicated portal to view scheduled classes.
- **Staff Tracking**: Mark teacher attendance (Present/Absent/Late) for administrative records.
- **Reporting**: Ensure classes are being conducted as scheduled.

---

## 📚 Academic Hierarchy

The system models a real-world university structure:

1.  **College**: Top-level unit (e.g., College of Computing).
2.  **Department**: Specific field (e.g., Software Engineering, Computer Science).
3.  **Program**: Specialized track (e.g., Regular, Extension, Summer, PhD).
4.  **Academic Year**: The cohort year (e.g., Year 1, Year 2).
5.  **Semester**: Term within the year (e.g., Semester 1, Semester 2).
6.  **Section**: The physical class group (e.g., Section A, Section B).

**Smart Enrollment**:
When a Course is assigned to a **Section**, all Students currently in that Section are **automatically enrolled** in the Course. If a new Student is added to the Section later, they are also enrolled instantly. This eliminates manual data entry for thousands of students.

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** Database (Local or Cloud)
- **Git**

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-org/jju-cms.git
    cd jju-cms
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:

    ```env
    # Database Connection
    DATABASE_URL="postgresql://username:password@localhost:5432/jju_cms?schema=public"

    # NextAuth Configuration
    NEXTAUTH_SECRET="your-super-secret-key-change-this"
    NEXTAUTH_URL="http://localhost:3000"

    # Optional: Blob Storage (if using object storage)
    # BLOB_READ_WRITE_TOKEN="..."
    ```

4.  **Database Migration**
    Apply the Prisma schema to your database:

    ```bash
    npx prisma db push
    ```

    _Optional: Seed the database with initial admin user_

    ```bash
    npx prisma db seed
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

---

## 📖 Feature Walkthroughs

### Creating Users

1.  Navigate to **Users** in the sidebar.
2.  Click **"Add User"** or **"Bulk Upload"**.
3.  Select Role (Student/Teacher/etc).
4.  For Students, drill down the hierarchy (Dept -> Program -> Year -> Sem -> Section) to assign them correctly.
    - _Note: Assigning a student to a section auto-enrolls them in that section's courses._

### Managing Courses

1.  Go to **Courses**.
2.  Click **"Create Course"**.
3.  Assign a generic Title, Code, and select the Teacher.
4.  Link the Course to a specific Department and Semester.
5.  Once created, go to **Hierarchy**, find the specific **Section**, and use "Assign Course" to link this course to that section.

### Class Management

1.  Log in as a **Class Manager**.
2.  Go to **"Class Management"**.
3.  Select the Date.
4.  View the list of courses scheduled/active.
5.  Mark the Teacher as **Present**, **Absent**, or **Late**.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is proprietary software for **Jigjiga University**.
Unauthorized copying of this file, via any medium is strictly prohibited.
# jju-cms
# jju-cms
# jju-cms
