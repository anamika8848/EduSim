# EduSim – Virtual Laboratory Simulator

EduSim is a full-stack web-based Virtual Laboratory Simulator designed to provide students with an interactive environment for performing laboratory experiments digitally. The platform also integrates classroom and academic management features for teachers and administrators.

## Features

- Virtual laboratory experiments
- Student, Teacher, and Administrator roles
- JWT-based authentication and authorization
- Classroom management
- Assignment creation and submission
- Laboratory examinations
- Practice observations and lab records
- Announcements
- Student progress tracking
- Reports and analytics
- Achievement tracking

## User Roles

### Student
- Access virtual laboratory experiments
- Join classrooms
- View and submit assignments
- Attend laboratory examinations
- Record experiment observations
- Track academic progress

### Teacher
- Create and manage classrooms
- Create and manage assignments
- Conduct laboratory examinations
- Manage students
- Post announcements
- Monitor student performance

### Administrator
- Manage users
- Manage classrooms
- Manage assignments
- Monitor overall system activities

## Technology Stack

- React.js
- Java
- Spring Boot
- Spring Security
- JWT
- REST APIs
- Spring Data JPA
- MySQL
- Maven

## System Architecture

```text
React.js Frontend
        ↓
     Axios
        ↓
Spring Boot REST APIs
        ↓
   Service Layer
        ↓
 Repository Layer
        ↓
      MySQL

### Next, add this **below the architecture section**:

```markdown
## Project Structure

```text
EduSim/
├── backend/
│   ├── src/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md

##Authentication

EduSim uses Spring Security and JWT-based authentication
to securely authenticate users and provide role-based access to different features.

Key Contributions
Developed the full-stack Virtual Laboratory Simulator using React.js and Spring Boot.
Implemented role-based functionality for Student, Teacher, and Administrator.
Integrated the React.js frontend with Spring Boot REST APIs.
Implemented JWT-based authentication and authorization.
Integrated MySQL using Spring Data JPA.
Developed classroom, assignment, laboratory examination, and virtual experiment management features.

How to Run
Prerequisites
-Java 17 or later
-Node.js and npm
-MySQL
-Maven

Backend
 cd backend
 mvn spring-boot:run
Frontend
 cd frontend
 npm install
 npm run dev

Configure the MySQL database and update the backend database configuration
before running the application.

Future Enhancements

AI-powered laboratory assistance
VR-based laboratory simulations
Advanced learning analytics
Cloud deployment
Mobile application support
