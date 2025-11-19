# Asano - Project Management Application

## Table of Contents
1. [Installation Guide](#installation-guide)
2. [Technical Architecture](#technical-architecture)
3. [Modules and Features](#modules-and-features)

---

## Installation Guide

### Prerequisites

Before installing the application, ensure you have the following software installed:

- **PHP** >= 8.2
- **Composer** >= 2.0
- **Node.js** >= 18.x
- **npm** or **yarn**
- **MySQL** >= 8.0 or **MariaDB** >= 10.3
- **Git**

### Backend Installation (Laravel)

1. **Clone the repository**
```bash
git clone git@git.unistra.fr:depeli/sae_501.git
cd sae_501
```

2. **Navigate to backend directory**
```bash
cd backend
```

3. **Install PHP dependencies**
```bash
composer install
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and application settings:
```env
APP_NAME=Asano
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=asano
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@asano.com
MAIL_FROM_NAME="${APP_NAME}"

FRONTEND_URL=http://localhost:5173
```

5. **Generate application key**
```bash
php artisan key:generate
```

6. **Create database**
```bash
mysql -u your_username -p
CREATE DATABASE asano CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

7. **Run database migrations**
```bash
php artisan migrate
```

8. **Create storage symbolic link**
```bash
php artisan storage:link
```

9. **Set proper permissions**
```bash
chmod -R 775 storage bootstrap/cache
```

10. **Start the development server**
```bash
php artisan serve
```

The backend API will be available at `http://localhost:8000`

### Frontend Installation (React + Vite)

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Start the development server**
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`

### Quick Start Script

For convenience, you can use the provided startup script:

```bash
chmod +x start-servers.sh
./start-servers.sh
```

This script will start both backend and frontend servers simultaneously.

### Running Tests

**Backend tests:**
```bash
cd backend
php artisan test
```

**Frontend tests:**
```bash
cd frontend
npm run test
```

---

## Technical Architecture

### Overview

Asano is a modern project management application built with a decoupled architecture:

- **Backend**: RESTful API built with Laravel 12 (PHP)
- **Frontend**: Single Page Application (SPA) built with React 18, TypeScript, and Vite
- **Database**: MySQL/MariaDB with relational schema
- **Authentication**: JWT-based token authentication with Laravel Sanctum

### Technology Stack

#### Backend
- **Framework**: Laravel 12.x
- **Language**: PHP 8.2+
- **Database ORM**: Eloquent
- **Authentication**: Laravel Sanctum
- **Email**: Laravel Mail with queue support
- **Export**: Laravel Excel (Maatwebsite)
- **PDF Generation**: DomPDF
- **Task Scheduling**: Laravel Scheduler
- **Queue System**: Database driver

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context API + Custom Hooks
- **UI Library**: Ant Design 5.x
- **Styling**: Tailwind CSS 4.x
- **UI Icons**: Lucide React
- **Rich Text Editor**: Quill.js
- **Drag & Drop**: @hello-pangea/dnd
- **Date Handling**: dayjs
- **Testing**: Vitest + React Testing Library

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Modules    │  │  Components  │  │    Hooks     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST API (Axios)
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Laravel)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │    Models    │  │  Middleware  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Routes    │  │ Notifications│  │    Traits    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼──────┐  ┌────▼─────┐
            │   Database   │  │  Queue   │
            │  (MySQL)     │  │  System  │
            └──────────────┘  └──────────┘
```

### Database Schema

The application uses a relational database with the following main entities:

- **users**: User accounts and authentication
- **projects**: Project containers
- **project_user**: Many-to-many relationship (users ↔ projects)
- **epics**: Large work items within projects
- **sprints**: Time-boxed iterations
- **tasks**: Individual work items
- **invitations**: Project invitation system
- **notifications**: User notification system
- **activity_logs**: Audit trail for all actions
- **jobs**: Queue system for background tasks

---

## Modules and Features

### 1. Authentication Module

**Location**: 
- Backend: `backend/app/Http/Controllers/AuthController.php`
- Frontend: `frontend/src/modules/auth/`

**Features**:
- User registration with email verification
- Login with JWT token generation
- Password reset via email
- Email verification system
- Logout and token invalidation

**Components**:
- `LoginSplit.tsx`: Login interface
- `RegisterSplit.tsx`: Registration interface
- `ForgotPassword.tsx`: Password recovery
- `ResetPassword.tsx`: Password reset form
- `AuthContext.tsx`: Authentication state management

### 2. Dashboard Module

**Location**:
- Backend: Various controllers for data aggregation
- Frontend: `frontend/src/modules/dashboard/`

**Features**:
- Project overview and statistics
- Recent activity feed
- Task completion metrics
- Sprint progress visualization
- Quick access to recent projects

**Components**:
- `DashboardDuna.tsx`: Main dashboard interface with charts and statistics

### 3. Project Management Module

**Location**:
- Backend: `backend/app/Http/Controllers/ProjectController.php`
- Frontend: `frontend/src/modules/projects/`

**Features**:
- Create, read, update, delete projects
- Project member management
- Project invitation system
- Project archiving
- Role-based access control (owner, member)

**Components**:
- `Projects.tsx`: Project list and management
- `ProjectInviteModal.tsx`: Invite users to projects
- `ProjectMembersModal.tsx`: Manage project members

**Models**:
- `Project.php`: Project entity with relationships

### 4. Task Management Module

**Location**:
- Backend: `backend/app/Http/Controllers/TaskController.php`
- Frontend: `frontend/src/modules/tasks/`

**Features**:
- Create, update, delete tasks
- Task assignment to users
- Priority levels (low, medium, high, critical)
- Status tracking (todo, in_progress, in_review, done)
- Due date management
- Rich text descriptions
- Task search and filtering
- Task export (CSV, PDF)

**Components**:
- `RichTextEditor.tsx`: Quill-based editor for task descriptions
- `TasksSearch.tsx`: Advanced task search interface

**Models**:
- `Task.php`: Task entity with relationships and scopes

### 5. Kanban Board Module

**Location**:
- Backend: Task and Sprint controllers
- Frontend: `frontend/src/modules/kanban/`

**Features**:
- Drag-and-drop task management
- Column-based workflow (To Do, In Progress, In Review, Done)
- Real-time task status updates
- Sprint-based task organization
- Visual task cards with priority indicators

**Components**:
- `KanbanModern.tsx`: Interactive Kanban board with drag-and-drop

**Hooks**:
- `useKanbanBoard.ts`: Kanban state management and operations

### 6. Epic Management Module

**Location**:
- Backend: `backend/app/Http/Controllers/EpicController.php`
- Frontend: `frontend/src/modules/epics/`

**Features**:
- Create and manage epics (large work items)
- Link tasks to epics
- Epic progress tracking
- Epic completion percentage
- Epic timeline visualization

**Components**:
- `Epics.tsx`: Epic list and management interface

**Models**:
- `Epic.php`: Epic entity with task relationships

### 7. Sprint Management Module

**Location**:
- Backend: Sprint controller (integrated with Task controller)
- Frontend: Integrated in Kanban and Roadmap modules

**Features**:
- Create time-boxed sprints
- Sprint planning and task assignment
- Sprint progress tracking
- Sprint velocity metrics
- Sprint retrospectives

**Models**:
- `Sprint.php`: Sprint entity with date ranges

**Hooks**:
- `useSprints.ts`: Sprint data management

### 8. Roadmap Module

**Location**:
- Frontend: `frontend/src/modules/roadmap/`

**Features**:
- Timeline visualization of epics and sprints
- Gantt-style project planning
- Milestone tracking
- Progress indicators
- Date-based filtering

**Components**:
- `RoadmapTimelineDuna.tsx`: Interactive timeline visualization

### 9. Notification System

**Location**:
- Backend: `backend/app/Http/Controllers/NotificationController.php`
- Backend: `backend/app/Notifications/`
- Frontend: `frontend/src/components/NotificationCenter.tsx`

**Features**:
- Real-time notifications
- Task assignment notifications
- Task deadline reminders
- Project invitation notifications
- Mark as read/unread
- Notification preferences

**Notification Types**:
- `TaskAssignedNotification.php`: When a task is assigned
- `TaskDueSoonNotification.php`: Task deadline approaching
- `TaskOverdueNotification.php`: Task past due date
- `VerifyEmailNotification.php`: Email verification

### 10. Activity Log Module

**Location**:
- Backend: `backend/app/Http/Controllers/ActivityLogController.php`
- Backend: `backend/app/Traits/LogsActivity.php`
- Frontend: `frontend/src/modules/activities/`

**Features**:
- Automatic activity tracking
- Audit trail for all actions
- User activity history
- Project activity feed
- Filterable activity logs

**Components**:
- `ActivityHistory.tsx`: Activity timeline display

**Models**:
- `ActivityLog.php`: Activity log entries

**Traits**:
- `LogsActivity.php`: Automatic activity logging for models

### 11. User Management Module

**Location**:
- Backend: User model and authentication
- Frontend: `frontend/src/modules/users/`

**Features**:
- User profile management
- Avatar upload
- User directory
- User search
- Profile customization

**Components**:
- `ProfileModern.tsx`: User profile page
- `UsersModern.tsx`: User directory

### 12. Settings Module

**Location**:
- Frontend: `frontend/src/modules/settings/`

**Features**:
- Account settings
- Notification preferences
- Theme customization
- Language selection
- Privacy settings

**Components**:
- `SettingsModern.tsx`: Settings interface

### 13. Analytics Module

**Location**:
- Frontend: `frontend/src/modules/analytics/`

**Features**:
- Project performance metrics
- Task completion trends
- Team productivity analytics
- Sprint velocity charts
- Burndown charts

**Components**:
- `Analytics.tsx`: Analytics dashboard with charts

### 14. Export Module

**Location**:
- Backend: `backend/app/Http/Controllers/ExportController.php`
- Backend: `backend/app/Exports/TasksExport.php`

**Features**:
- Export tasks to CSV
- Export tasks to PDF
- Custom export filters
- Scheduled exports

### 15. Email System

**Location**:
- Backend: `backend/app/Mail/`

**Features**:
- Project invitation emails
- Password reset emails
- Email verification
- Task notification emails
- Queue-based email delivery

**Mail Classes**:
- `ProjectInvitationMail.php`: Project invitation emails
- `PasswordResetMail.php`: Password reset emails

### 16. Search Module

**Location**:
- Frontend: `frontend/src/components/GlobalSearch.tsx`

**Features**:
- Global search across projects, tasks, and users
- Real-time search results
- Keyboard shortcuts (Cmd/Ctrl + K)
- Quick navigation

### 17. Invitation System

**Location**:
- Backend: `backend/app/Http/Controllers/ProjectInvitationController.php`
- Backend: `backend/app/Models/Invitation.php`

**Features**:
- Invite users to projects via email
- Accept/decline invitations
- Invitation expiration
- Invitation tracking

### 18. Background Jobs & Scheduling

**Location**:
- Backend: `backend/app/Console/Commands/`

**Features**:
- Automated task deadline checks
- Scheduled notifications
- Database cleanup tasks
- Email queue processing

**Commands**:
- `CheckTaskDeadlines.php`: Check for overdue and due-soon tasks
- `CleanupProjectMembers.php`: Remove inactive project members

---

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/password/email` - Request password reset
- `POST /api/password/reset` - Reset password
- `POST /api/email/verify/{id}/{hash}` - Verify email

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/members` - Add member
- `DELETE /api/projects/{id}/members/{userId}` - Remove member

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/search` - Search tasks
- `GET /api/tasks/export` - Export tasks

### Epics
- `GET /api/epics` - List epics
- `POST /api/epics` - Create epic
- `PUT /api/epics/{id}` - Update epic
- `DELETE /api/epics/{id}` - Delete epic

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

### Activity Logs
- `GET /api/activity-logs` - List activity logs
- `GET /api/projects/{id}/activities` - Project activities

---

## Security Features

- **Authentication**: JWT token-based authentication with Laravel Sanctum
- **Authorization**: Role-based access control (RBAC)
- **CSRF Protection**: Enabled for all state-changing operations
- **XSS Protection**: Input sanitization and output escaping
- **SQL Injection Prevention**: Eloquent ORM with prepared statements
- **Password Hashing**: Bcrypt algorithm
- **Email Verification**: Required for new accounts
- **Rate Limiting**: API throttling to prevent abuse

---

---

## License

This project is developed for educational purposes as part of SAE 501.

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.
