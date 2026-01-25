export const PERMISSIONS = {
  DEPARTMENTS: {
    VIEW_ALL: "view-all-departments",
    VIEW: "view-department",
    CREATE: "create-department",
    EDIT: "edit-department",
    DELETE: "delete-department",
  },

  // Employee Permissions
  EMPLOYEES: {
    VIEW_ALL: "view-all-employees",
    VIEW: "view-employee",
    CREATE: "create-employee",
    EDIT: "edit-employee",
    DELETE: "delete-employee",
  },

  // Contract Permissions
  CONTRACTS: {
    VIEW_ALL: "view-all-contracts",
    VIEW: "view-contract",
    CREATE: "create-contract",
    EDIT: "edit-contract",
    DELETE: "delete-contract",
  },

  // Document Permissions
  DOCUMENTS: {
    VIEW_ALL: "view-all-documents",
    VIEW: "view-document",
    CREATE: "create-document",
    EDIT: "edit-document",
    DELETE: "delete-document",
  },

  // Job Position Permissions
  JOB_POSITIONS: {
    VIEW_ALL: "view-all-job-positions",
    VIEW: "view-job-position",
    CREATE: "create-job-position",
    EDIT: "edit-job-position",
    DELETE: "delete-job-position",
  },

  // Leave Request Permissions
  LEAVE_REQUESTS: {
    MANAGER_APPROVE: "manager-approve-leave-request",
    HR_APPROVE: "hr-approve-leave-request",
    VIEW_EMPLOYEES: "view-employees-leave-request",
  },

  // Leave Type Permissions
  LEAVE_TYPES: {
    VIEW_ALL: "view-all-leave-types",
    VIEW: "view-leave-type",
    CREATE: "create-leave-type",
    EDIT: "edit-leave-type",
    DELETE: "delete-leave-type",
  },

  // Allowance Permissions
  ALLOWANCES: {
    VIEW_ALL: "view-all-allowances",
    VIEW: "view-allowance",
    CREATE: "create-allowance",
    EDIT: "edit-allowance",
    DELETE: "delete-allowance",
  },

  // Benefit Permissions
  BENEFITS: {
    VIEW_ALL: "view-all-benefits",
    VIEW: "view-benefit",
    CREATE: "create-benefit",
    EDIT: "edit-benefit",
    DELETE: "delete-benefit",
  },

  // Deduction Permissions
  DEDUCTIONS: {
    VIEW_ALL: "view-all-deductions",
    VIEW: "view-deduction",
    CREATE: "create-deduction",
    EDIT: "edit-deduction",
    DELETE: "delete-deduction",
  },

  // Payroll Permissions
  PAYROLLS: {
    VIEW_ALL: "view-all-payrolls",
    VIEW: "view-payroll",
    CREATE: "create-payroll",
    EDIT: "edit-payroll",
    DELETE: "delete-payroll",
    CREATE_PAYMENT: "create-payroll-payment",
  },

  // Trainer Permissions
  TRAINERS: {
    VIEW_ALL: "view-all-trainers",
    VIEW: "view-trainer",
    CREATE: "create-trainer",
    EDIT: "edit-trainer",
    DELETE: "delete-trainer",
  },

  // Training Certificate Permissions
  TRAINING_CERTIFICATES: {
    VIEW_ALL: "view-all-training-certificates",
    VIEW: "view-training-certificate",
    CREATE: "create-training-certificate",
    EDIT: "edit-training-certificate",
    DELETE: "delete-training-certificate",
  },

  // Training Evaluation Permissions
  TRAINING_EVALUATIONS: {
    VIEW_ALL: "view-all-training-evaluations",
    VIEW: "view-training-evaluation",
    CREATE: "create-training-evaluation",
    EDIT: "edit-training-evaluation",
    DELETE: "delete-training-evaluation",
  },

  // Training Session Permissions
  TRAINING_SESSIONS: {
    VIEW_ALL: "view-all-training-sessions",
    VIEW: "view-training-session",
    CREATE: "create-training-session",
    EDIT: "edit-training-session",
    DELETE: "delete-training-session",
  },

  // Employee Training Permissions
  EMPLOYEE_TRAININGS: {
    VIEW_ALL: "view-all-employee-trainings",
    VIEW: "view-employee-training",
    CREATE: "create-employee-training",
    EDIT: "edit-employee-training",
    DELETE: "delete-employee-training",
  },

  // Job Post Permissions
  JOB_POSTS: {
    VIEW_ALL: "view-all-job-posts",
    VIEW: "view-job-post",
    CREATE: "create-job-post",
    EDIT: "edit-job-post",
    DELETE: "delete-job-post",
  },

  // Hiring Stage Permissions
  HIRING_STAGES: {
    VIEW_ALL: "view-all-hiring-stages",
    VIEW: "view-hiring-stage",
    CREATE: "create-hiring-stage",
    EDIT: "edit-hiring-stage",
    DELETE: "delete-hiring-stage",
  },

  // Applicant Permissions
  APPLICANTS: {
    VIEW_ALL: "view-all-applicants",
    VIEW: "view-applicant",
    CREATE: "create-applicant",
    EDIT: "edit-applicant",
    DELETE: "delete-applicant",
  },

  // Interview Permissions
  INTERVIEWS: {
    VIEW_ALL: "view-all-interviews",
    VIEW: "view-interview",
    CREATE: "create-interview",
    EDIT: "edit-interview",
    DELETE: "delete-interview",
  },

  // Asset Permissions
  ASSETS: {
    VIEW_ALL: "view-all-assets",
    VIEW: "view-asset",
    CREATE: "create-asset",
    EDIT: "edit-asset",
    DELETE: "delete-asset",
  },

  // Asset Assignment Permissions
  ASSET_ASSIGNMENTS: {
    VIEW_ALL: "view-all-asset-assignments",
    VIEW: "view-asset-assignment",
    CREATE: "create-asset-assignment",
    EDIT: "edit-asset-assignment",
    DELETE: "delete-asset-assignment",
  },

  // Expense Category Permissions
  EXPENSE_CATEGORIES: {
    VIEW_ALL: "view-all-expense-categories",
    VIEW: "view-expense-category",
    CREATE: "create-expense-category",
    EDIT: "edit-expense-category",
    DELETE: "delete-expense-category",
  },

  // Expense Permissions
  EXPENSES: {
    VIEW_ALL: "view-all-expenses",
    VIEW: "view-expense",
    CREATE: "create-expense",
    EDIT: "edit-expense",
    DELETE: "delete-expense",
  },

  // Attendance Permissions
  ATTENDANCES: {
    VIEW_ALL: "view-all-attendances",
    VIEW: "view-attendance",
    CREATE: "create-attendance",
    EDIT: "edit-attendance",
    DELETE: "delete-attendance",
  },

  // Role Management Permissions
  ROLES: {
    MANAGE: "roles-manage",
    ASSIGN: "assign-roles",
  },

  // Evaluation Cycle Permissions
  EVALUATION_CYCLES: {
    VIEW_ALL: "view-all-evaluation-cycles",
    VIEW: "view-evaluation-cycle",
    CREATE: "create-evaluation-cycle",
    EDIT: "edit-evaluation-cycle",
    DELETE: "delete-evaluation-cycle",
  },

  // Competency Permissions
  COMPETENCIES: {
    VIEW_ALL: "view-all-competencies",
    VIEW: "view-competency",
    CREATE: "create-competency",
    EDIT: "edit-competency",
    DELETE: "delete-competency",
  },

  // Performance Review Permissions
  PERFORMANCE_REVIEWS: {
    VIEW_ALL: "view-all-performance-reviews",
    VIEW: "view-performance-review",
    CREATE: "create-performance-review",
    EDIT: "edit-performance-review",
    DELETE: "delete-performance-review",
  },

  // Review Rating Permissions
  REVIEW_RATINGS: {
    VIEW_ALL: "view-all-review-ratings",
    VIEW: "view-review-rating",
    CREATE: "create-review-rating",
    EDIT: "edit-review-rating",
    DELETE: "delete-review-rating",
  },

  // Goal Permissions
  GOALS: {
    VIEW_ALL: "view-all-goals",
    VIEW: "view-goal",
    CREATE: "create-goal",
    EDIT: "edit-goal",
    DELETE: "delete-goal",
  },

  // Goal Progress Update Permissions
  GOAL_PROGRESS_UPDATES: {
    VIEW_ALL: "view-all-goal-progress-updates",
    VIEW: "view-goal-progress-update",
    CREATE: "create-goal-progress-update",
    EDIT: "edit-goal-progress-update",
    DELETE: "delete-goal-progress-update",
  },
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

