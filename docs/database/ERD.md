# IntelliHR Database — Entity Relationship Diagram

This document describes the **actual** IntelliHR database schema (from Laravel migrations), with consistent naming, relationships, and cardinality.

**Conventions used:**
- **Tables:** `snake_case` (matches schema).
- **Primary key:** `id` (bigint) unless noted.
- **Foreign keys:** `*_id` referencing parent `id`; nullable where applicable.
- **Audit:** `created_at`, `updated_at` on most tables; `deleted_at` where soft deletes exist.
- **Cardinality:** `||--o{` one-to-many, `}o--o{` many-to-many (via pivot), `||--||` one-to-one.

---

## Core: Users & Employees

```mermaid
erDiagram
    users {
        bigint id PK
        bigint employee_id FK "unique"
        string personal_email "unique"
        timestamp email_verified_at
        string password
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    employees {
        bigint id PK
        string first_name
        string last_name
        string work_email
        string phone
        enum gender
        string national_id
        date birth_date
        text address
        enum employee_status
        bigint department_id FK
        bigint manager_id FK "self"
        bigint job_id FK
        date hire_date
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    departments {
        bigint id PK
        string name "unique"
        text description
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    job_positions {
        bigint id PK
        string title "unique"
        string grade
        bigint department_id FK
        decimal min_salary
        decimal max_salary
        text responsibilities
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    users ||--|| employees : "belongs to"
    employees }o--|| departments : "department"
    employees }o--o| employees : "manager"
    employees }o--o| job_positions : "job"
    job_positions }o--|| departments : "department"
```

---

## Leave Management

```mermaid
erDiagram
    leave_types {
        bigint id PK
        string name "unique"
        string code "unique"
        smallint annual_entitlement
        enum accrual_policy
        smallint carry_over_limit
        tinyint min_request_days
        tinyint max_request_days
        boolean requires_hr_approval
        boolean is_active
        enum payment_type
        boolean requires_attachment
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    leave_balances {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        int total_entitlement
        int used_days
        int remaining_days
        year year
        timestamp created_at
        timestamp updated_at
    }

    leave_requests {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        date start_date
        date end_date
        int days
        text reason
        string attachment
        enum status
        bigint manager_id FK
        timestamp manager_approved_at
        bigint hr_id FK
        timestamp hr_approved_at
        timestamp created_at
        timestamp updated_at
    }

    employees ||--o{ leave_balances : "has"
    employees ||--o{ leave_requests : "requests"
    leave_types ||--o{ leave_balances : "type"
    leave_types ||--o{ leave_requests : "type"
    employees ||--o{ leave_requests : "manager approves"
    employees ||--o{ leave_requests : "hr approves"
```

---

## Attendance & Documents

```mermaid
erDiagram
    attendances {
        bigint id PK
        bigint employee_id FK
        date date
        timestamp check_in
        boolean is_late
        timestamp check_out
        decimal calculated_hours
        string location
        string check_in_ip
        string check_out_ip
        text notes
        enum status
        int break_duration_minutes
        decimal overtime_hours
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    documents {
        bigint id PK
        bigint employee_id FK
        string doc_type
        string file_path
        timestamp uploaded_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    contracts {
        bigint id PK
        bigint employee_id FK
        date start_date
        date end_date
        enum contract_type
        smallint probation_period_days
        decimal salary
        text terms
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    employees ||--o{ attendances : "has"
    employees ||--o{ documents : "has"
    employees ||--o{ contracts : "has"
```

---

## Payroll & Benefits

```mermaid
erDiagram
    payrolls {
        bigint id PK
        bigint employee_id FK
        int year
        int month
        decimal basic_salary
        decimal allowances
        decimal deductions
        decimal net_pay
        timestamp processed_at
        string payment_status
        string stripe_charge_id
        timestamp paid_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    allowances {
        bigint id PK
        bigint payroll_id FK "nullable"
        bigint employee_id FK
        string type
        decimal amount
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    deductions {
        bigint id PK
        bigint payroll_id FK "nullable"
        bigint employee_id FK
        string type
        decimal amount
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    benefits {
        bigint id PK
        bigint employee_id FK
        string benefit_type
        decimal amount
        boolean is_deduction
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    employees ||--o{ payrolls : "has"
    employees ||--o{ allowances : "has"
    employees ||--o{ deductions : "has"
    employees ||--o{ benefits : "has"
    payrolls ||--o{ allowances : "has"
    payrolls ||--o{ deductions : "has"
```

---

## Training

```mermaid
erDiagram
    trainers {
        bigint id PK
        enum type "internal, external"
        bigint employee_id FK "nullable"
        string name
        string email
        string phone
        string company
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    training_sessions {
        bigint id PK
        string title
        date start_date
        date end_date
        bigint trainer_id FK "nullable"
        bigint department_id FK "nullable"
        text description
        timestamp created_at
        timestamp updated_at
    }

    employee_trainings {
        bigint id PK
        bigint employee_id FK
        bigint training_id FK
        enum status
        date completion_date
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    training_evaluations {
        bigint id PK
        bigint employee_id FK
        bigint training_id FK
        tinyint rating
        text feedback
        timestamp created_at
        timestamp updated_at
    }

    training_certificates {
        bigint id PK
        bigint employee_training_id FK
        date issued_at
        string certificate_path
        timestamp created_at
        timestamp updated_at
    }

    employees ||--o| trainers : "internal trainer"
    trainers ||--o{ training_sessions : "delivers"
    departments }o--o{ training_sessions : "department"
    employees ||--o{ employee_trainings : "enrolled"
    training_sessions ||--o{ employee_trainings : "session"
    employee_trainings ||--o{ training_evaluations : "evaluated by"
    training_sessions ||--o{ training_evaluations : "evaluated"
    employees ||--o{ training_evaluations : "employee"
    employee_trainings ||--o{ training_certificates : "has"
```

---

## Recruitment (Job Posts & Applicants)

```mermaid
erDiagram
    job_posts {
        bigint id PK
        string title
        text description
        text requirements
        text responsibilities
        bigint department_id FK
        enum job_type
        enum status
        timestamp posted_at
        string linkedin_job_id
        timestamp created_at
        timestamp updated_at
    }

    hiring_stages {
        bigint id PK
        bigint job_id FK
        string stage_name
        int order
        timestamp created_at
        timestamp updated_at
    }

    applicants {
        bigint id PK
        bigint job_id FK
        string first_name
        string last_name
        string email
        string phone
        boolean is_employee
        enum status
        string source
        int experience_years
        bigint current_stage_id FK "nullable"
        string resume_path
        timestamp applied_at
        decimal ai_score
        json ai_analysis
        json ai_matched_skills
        json ai_missing_skills
        enum ai_recommendation
        timestamp ai_analyzed_at
        enum ai_analysis_status
        timestamp created_at
        timestamp updated_at
    }

    interviews {
        bigint id PK
        bigint applicant_id FK
        bigint interviewer_id FK "nullable"
        timestamp scheduled_at
        int score
        text notes
        enum status
        timestamp created_at
        timestamp updated_at
    }

    departments ||--o{ job_posts : "has"
    job_posts ||--o{ hiring_stages : "stages"
    job_posts ||--o{ applicants : "applicants"
    hiring_stages ||--o{ applicants : "current_stage"
    applicants ||--o{ interviews : "has"
    employees }o--o{ interviews : "interviewer"
```

---

## Assets & Expenses

```mermaid
erDiagram
    assets {
        bigint id PK
        string name
        string serial_number "unique"
        string condition
        enum status
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    asset_assignments {
        bigint id PK
        bigint asset_id FK
        bigint employee_id FK
        date assigned_date
        date return_date
        timestamp created_at
        timestamp updated_at
    }

    expense_categories {
        bigint id PK
        string name
        timestamp created_at
        timestamp updated_at
    }

    expenses {
        bigint id PK
        bigint employee_id FK
        bigint category_id FK
        decimal amount
        date expense_date
        enum status
        text notes
        string receipt_path
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    assets ||--o{ asset_assignments : "assigned"
    employees ||--o{ asset_assignments : "assigned to"
    employees ||--o{ expenses : "submits"
    expense_categories ||--o{ expenses : "category"
```

---

## Performance (Evaluation Cycles, Reviews, Goals)

```mermaid
erDiagram
    evaluation_cycles {
        bigint id PK
        string name
        enum type
        int year
        enum period
        date start_date
        date end_date
        date self_assessment_deadline
        date manager_review_deadline
        date calibration_deadline
        date final_review_deadline
        enum status
        json rating_scale
        boolean include_self_assessment
        boolean include_goals
        text description
        bigint created_by FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    competencies {
        bigint id PK
        string name
        text description
        enum category
        enum applicable_to
        json rating_descriptors
        int weight
        boolean is_active
        int display_order
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    performance_reviews {
        bigint id PK
        bigint evaluation_cycle_id FK
        bigint employee_id FK
        bigint reviewer_id FK "nullable"
        enum status
        text self_assessment_summary
        json self_assessment_achievements
        json self_assessment_challenges
        json self_assessment_goals
        timestamp self_assessment_submitted_at
        text manager_summary
        json manager_strengths
        json manager_areas_for_improvement
        json manager_goals_for_next_period
        text manager_additional_comments
        timestamp manager_review_submitted_at
        string overall_rating
        decimal overall_score
        boolean promotion_recommended
        decimal salary_increase_percentage
        decimal bonus_amount
        json recommended_training
        json development_plan
        timestamp acknowledged_at
        text employee_acknowledgment_comments
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    review_ratings {
        bigint id PK
        bigint performance_review_id FK
        bigint competency_id FK
        int self_rating
        text self_rating_comment
        int manager_rating
        text manager_rating_comment
        timestamp created_at
        timestamp updated_at
    }

    goals {
        bigint id PK
        bigint employee_id FK
        bigint evaluation_cycle_id FK "nullable"
        bigint set_by FK
        string title
        text description
        enum type
        enum category
        json success_criteria
        date start_date
        date target_date
        int weight
        enum status
        int progress_percentage
        text completion_notes
        enum achievement_level
        int self_rating
        int manager_rating
        text manager_comments
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    goal_progress_updates {
        bigint id PK
        bigint goal_id FK
        bigint updated_by FK
        text update_note
        int progress_percentage
        enum status
        date update_date
        timestamp created_at
        timestamp updated_at
    }

    employees ||--o{ evaluation_cycles : "created_by"
    evaluation_cycles ||--o{ performance_reviews : "has"
    evaluation_cycles }o--o{ goals : "cycle"
    employees ||--o{ performance_reviews : "reviewed"
    employees }o--o{ performance_reviews : "reviewer"
    performance_reviews ||--o{ review_ratings : "has"
    competencies ||--o{ review_ratings : "rated"
    employees ||--o{ goals : "has"
    employees ||--o{ goals : "set_by"
    goals ||--o{ goal_progress_updates : "has"
    employees ||--o{ goal_progress_updates : "updated_by"
```

---

## AI & Chat

```mermaid
erDiagram
    chat_conversations {
        bigint id PK
        bigint user_id FK "nullable"
        bigint employee_id FK "nullable"
        string session_id
        text message
        text response
        json context_data
        int tokens_used
        timestamp created_at
        timestamp updated_at
    }

    ai_usage_analytics {
        bigint id PK
        enum feature_type
        bigint user_id FK "nullable"
        bigint employee_id FK "nullable"
        bigint applicant_id "nullable, no FK"
        bigint conversation_id "nullable, no FK"
        string model
        int tokens_used
        decimal estimated_cost
        text prompt_preview
        int prompt_length
        int response_length
        int response_time_ms
        enum status
        text error_message
        timestamp created_at
        timestamp updated_at
    }

    users }o--o{ chat_conversations : "has"
    employees }o--o{ chat_conversations : "has"
    users }o--o{ ai_usage_analytics : "tracked"
    employees }o--o{ ai_usage_analytics : "tracked"
```

---

## Authorization (Spatie Permission)

```mermaid
erDiagram
    permissions {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    roles {
        bigint id PK
        string name
        string guard_name
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    model_has_permissions {
        bigint permission_id FK
        string model_type
        bigint model_id
    }

    model_has_roles {
        bigint role_id FK
        string model_type
        bigint model_id
    }

    role_has_permissions {
        bigint permission_id FK
        bigint role_id FK
    }

    permissions ||--o{ model_has_permissions : "assigned"
    roles ||--o{ model_has_roles : "assigned"
    roles ||--o{ role_has_permissions : "has"
    permissions ||--o{ role_has_permissions : "in role"
```

*Note: `model_has_permissions` and `model_has_roles` use polymorphic `model_type` / `model_id` (e.g. `App\Models\User`), so User/Employee get roles and permissions via these pivot tables.*

---

## Best practices reflected in this schema

| Practice | How it appears |
|----------|----------------|
| **Consistent naming** | Tables and columns in `snake_case`; FKs as `*_id`. |
| **Single responsibility** | Each table models one entity (e.g. `leave_types` vs `leave_requests`). |
| **Explicit FKs** | All relationships use foreign key constraints. |
| **Audit trail** | `created_at`/`updated_at`; soft deletes (`deleted_at`) where needed. |
| **Normalization** | Lookups in reference tables (e.g. `leave_types`, `departments`, `job_positions`) instead of free text. |
| **Unique constraints** | Where needed (e.g. `employees.employee_id` for users, `leave_balances` per employee/type/year). |
| **Indexes** | Migrations define indexes on FKs and common filter/sort columns (not drawn in ERD for brevity). |

To regenerate or inspect the schema, use the migrations under `backend/database/migrations/`.
