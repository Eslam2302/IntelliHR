<p align="center">
  <img src="https://img.shields.io/badge/IntelliHR-HR%20Platform-6366f1?style=for-the-badge&logo=react&logoColor=white" alt="IntelliHR" />
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/Next.js-16-000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
</p>

<h1 align="center">IntelliHR</h1>
<p align="center">
  <strong>Full-scale Human Resources Management System</strong>
</p>
<p align="center">
  One codebase. Every HR need: core HR, attendance, leave, payroll, training, recruitment, performance, assets, expenses, and AI.
</p>

---

## Table of contents

- [Project at a glance](#-project-at-a-glance)
- [Why IntelliHR — key strengths](#-why-intellihr--key-strengths)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech stack](#-tech-stack)
- [Project structure](#-project-structure)
- [Getting started](#-getting-started)
- [Environment variables](#-environment-variables)
- [Documentation](#-documentation)
- [License](#-license)

---

## 📊 Project at a glance

| Metric | Count |
|--------|--------|
| **Backend API controllers** | 41 |
| **Eloquent models** | 35 |
| **Database tables** | 40+ (migrations) |
| **Dashboard pages (Next.js)** | 130+ |
| **API service modules (frontend)** | 36 |
| **Granular permissions** | 70+ (per-module CRUD + workflows) |
| **Repository interfaces + implementations** | 43+ |
| **Services (business logic)** | 43+ |
| **Data Transfer Objects (DTOs)** | 34 |
| **HR domains covered** | 9 (Core HR, Attendance, Leave, Payroll, Training, Hiring, Assets, Expenses, Performance) |

IntelliHR is a **production-style**, **portfolio-scale** project: repository pattern, service layer, DTOs, role-based access, audit logging, AI integration, and a fully typed frontend talking to a RESTful API.

---

## 💪 Why IntelliHR — key strengths

- **Clean backend architecture** — Repository pattern (interface + implementation) for every domain; business logic in dedicated Services; DTOs for request/response shaping. Controllers stay thin and testable.
- **Granular access control** — 70+ permissions (view/create/edit/delete per resource, plus workflow actions like manager/hr leave approval). Spatie Laravel Permission; roles assigned to employees; frontend hides UI by permission.
- **AI-powered features** — OpenAI resume analysis (score, matched/missing skills, recommendation) and an HR-focused chat assistant with session history and usage analytics (tokens, cost).
- **Real workflows** — Leave: submit → manager approve → HR approve. Performance: evaluation cycles → self-assessment → manager review → acknowledgment. Payroll: process by month, Stripe payment.
- **Type safety end-to-end** — TypeScript across the Next.js app; typed API client functions and shared types for all resources.
- **Audit & security** — Spatie Activity Log for important actions; signed URLs for document downloads; throttling on login and AI endpoints.
- **Modern stack** — Laravel 12, Next.js 16, React 19, Tailwind CSS 4; REST API + Sanctum token auth.
- **Documented schema** — Full database ERD (Mermaid) in the repo for every table and relationship.

---

## 🏗 Architecture

### Backend (Laravel)

- **Controllers** — HTTP only; delegate to Services.
- **Services** — Business logic, orchestration, validation; use Repositories and DTOs.
- **Repositories** — Data access behind interfaces (e.g. `EmployeeRepositoryInterface`); one repo per main entity.
- **DTOs** — Structured input/output; keep controllers and API responses consistent.
- **Auth** — Laravel Sanctum (API tokens); user ↔ employee link; permissions loaded with user.
- **AI** — Dedicated services: `HRChatAssistantService`, `ResumeAnalysisService`, `AIAnalyticsService`; OpenAI client and PDF parsing for resumes.

### Frontend (Next.js)

- **Permission-aware UI** — `PermissionGuard` and `ProtectedPage`; sidebar and actions respect backend permissions.
- **API layer** — One service file per domain (e.g. `employees.ts`, `performance-reviews.ts`); `fetchWithAuth` and shared types.
- **Dashboard** — 130+ pages: list, create, edit, detail, and workflow pages (e.g. self-assessment, manager review, acknowledge).

---

## ✨ Features

### Core HR
| Feature | Description |
|--------|-------------|
| **Departments** | Create and manage departments with descriptions. |
| **Employees** | Full profiles: name, contact, job, department, manager, hire date, status; role assignment. |
| **Job positions** | Positions with department, grade, salary range, responsibilities. |
| **Contracts** | Employee contracts: type, dates, salary, probation, terms. |
| **Documents** | Upload and manage employee documents; secure signed URLs for download. |

### Attendance & Leave
| Feature | Description |
|--------|-------------|
| **Attendance** | Check-in / check-out; my recent attendance; team attendance (managers). |
| **Attendances** | Full records: date, check-in/out, hours, late, status, breaks, overtime. |
| **Leave types** | Configurable types: entitlement, accrual, carryover, approval workflow. |
| **Leave requests** | Submit leave; manager then HR approval; my requests & manager dashboard. |
| **Leave balances** | Per employee, per type, per year. |

### Payroll
| Feature | Description |
|--------|-------------|
| **Benefits** | Employee benefits (type, amount, dates, deduction flag). |
| **Allowances / Deductions** | Linked to employee and optionally to payroll. |
| **Payrolls** | Monthly payroll (basic, allowances, deductions, net); process by month; Stripe payment. |

### Training
| Feature | Description |
|--------|-------------|
| **Trainers** | Internal (employee) or external. |
| **Training sessions** | Sessions with dates, trainer, department. |
| **Employee trainings** | Enroll employees; status and completion date. |
| **Training evaluations** | Ratings and feedback per employee/session. |
| **Training certificates** | Certificate upload linked to employee training. |

### Hiring (Recruitment)
| Feature | Description |
|--------|-------------|
| **Job posts** | Publish jobs (title, description, department, type, status). |
| **Hiring stages** | Custom stages per job post with order. |
| **Applicants** | Pipeline: resume, status, current stage. |
| **AI resume analysis** | OpenAI: score, matched/missing skills, recommendation. |
| **Interviews** | Schedule with interviewer and score. |

### Assets & Expenses
| Feature | Description |
|--------|-------------|
| **Assets** | Registry: name, serial number, condition, status. |
| **Asset assignments** | Assign to employees with dates. |
| **Expense categories** | Categories for expenses. |
| **Expenses** | Amount, category, receipt, approval workflow. |

### Performance evaluation
| Feature | Description |
|--------|-------------|
| **Evaluation cycles** | Annual, semi-annual, quarterly, probation; deadlines. |
| **Competencies** | Framework with category, rating descriptors, weight. |
| **Performance reviews** | Self-assessment → manager review → acknowledgment; ratings and outcomes. |
| **Review ratings** | Per-competency self and manager ratings. |
| **Goals** | SMART goals; type, category, progress, achievement. |
| **Goal progress updates** | Updates with status and notes. |

### AI & system
| Feature | Description |
|--------|-------------|
| **AI chat assistant** | HR-focused chat (OpenAI); session history and context. |
| **AI usage analytics** | Track resume analysis and chat (tokens, cost). |
| **Roles & permissions** | Spatie; assign roles to employees; 70+ permissions. |
| **Activity log** | Audit trail for key actions. |

---

## 🛠 Tech stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | PHP 8.2+, Laravel 12, Laravel Sanctum, Spatie Laravel Permission, Spatie Activity Log, OpenAI PHP Client, Stripe, Smalot PDF Parser, Redis (optional) |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Database** | MySQL / MariaDB (Laravel migrations) |

---

## 📁 Project structure

```
IntelliHR/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # 41 controllers
│   │   ├── Models/                 # 35 models
│   │   ├── Repositories/           # 43+ repos + interfaces
│   │   ├── Services/               # 43+ services (incl. OpenAI/)
│   │   └── DataTransferObjects/    # 34 DTOs
│   ├── database/migrations/        # 41 migrations
│   └── routes/api.php
├── frontend/                    # Next.js 16 app
│   ├── app/(dashboard)/dashboard/  # 130+ pages
│   ├── components/                 # PermissionGuard, layout, UI
│   ├── lib/constants/              # Permissions
│   ├── lib/types/                  # TypeScript types
│   ├── services/api/               # 36 API modules
│   └── config/api.ts
└── docs/database/ERD.md         # Full DB ERD (Mermaid)
```

---

## 🚀 Getting started

### Prerequisites

- **PHP** 8.2+, **Composer**
- **Node.js** 18+, **npm**
- **MySQL** (or MariaDB)
- **Redis** (optional)

### 1. Backend

```bash
git clone https://github.com/YOUR_USERNAME/IntelliHR.git
cd IntelliHR/backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env`: set `DB_*`, and optionally `OPENAI_API_KEY`, `STRIPE_*`, `REDIS_*`.

```bash
php artisan migrate
```

### 2. Frontend

```bash
cd ../frontend
npm install
```

Optional `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run

**Terminal 1 — API:** `cd backend && php artisan serve` → `http://localhost:8000`  
**Terminal 2 — Dashboard:** `cd frontend && npm run dev` → `http://localhost:3000`

Optional: `php artisan queue:listen` for queued jobs.

---

## 🔐 Environment variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `APP_URL` | Backend URL (e.g. `http://localhost:8000`) |
| `DB_*` | Database connection |
| `OPENAI_API_KEY` | For AI chat and resume analysis |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payroll payments (optional) |
| `REDIS_*` | Optional cache/sessions |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base (e.g. `http://localhost:8000/api`) |

---

## 📖 Documentation

- **[Database ERD](docs/database/ERD.md)** — Full entity-relationship diagram (Mermaid) for all tables.
- **API** — Endpoints in `backend/routes/api.php`; auth via Sanctum except login and signed document URL.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) if present.

---

<p align="center">
  <strong>IntelliHR</strong> — Full-scale HR management with clear architecture and control.
</p>
