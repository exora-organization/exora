**EXORA**

**Product Requirements Document**

Export Feasibility & Decision Support Platform

Document Version 3.0

Group 5 \- WacanaTech | President University

June 2026

# **Daftar Isi**

[**Daftar Isi	2**](#heading=)

[Document Version History	3](#heading=)

[1\. Product Overview	3](#heading=)

[1.1 Purpose	3](#heading=)

[1.2 Product Vision	3](#heading=)

[1.3 Problem Statement	4](#heading=)

[1.4 Proposed Solution	4](#heading=)

[1.5 Target Users	4](#heading=)

[2\. Stakeholders	5](#heading=)

[3\. Product Scope	5](#heading=)

[3.1 In-Scope	5](#heading=)

[3.2 Out-of-Scope	6](#heading=)

[4\. Functional Requirements	7](#heading=)

[Platform Requirements	7](#heading=)

[Export Engine Requirements (Retained from v2.1)	9](#heading=)

[5\. Non-Functional Requirements	9](#heading=)

[5.1 Performance	9](#heading=)

[5.2 Security	9](#heading=)

[5.3 Availability	10](#heading=)

[5.4 Usability	10](#heading=)

[6\. User Roles & Permissions	11](#heading=)

[Role Definition	11](#heading=)

[Guest	11](#heading=)

[Admin	11](#heading=)

[Company Owner	11](#heading=)

[Export Manager	11](#heading=)

[Finance Staff	11](#heading=)

[7\. Permissions Matrix	12](#heading=)

[8\. User Stories	12](#heading=)

[8.1 Authentication & Onboarding	12](#heading=)

[8.2 Team Management	13](#heading=)

[8.3 Multi-Tenant Access	14](#heading=)

[8.4 Export Case Management	14](#heading=)

[8.5 Pricing Calculation	14](#heading=)

[8.6 Financial Analysis	15](#heading=)

[8.7 Scenario Analysis	15](#heading=)

[8.8 Risk Assessment & Feasibility	16](#heading=)

[8.9 AI Decision Advisor	16](#heading=)

[8.10 Dashboard & Documents	16](#heading=)

[9\. Use Cases	17](#heading=)

[UC-01 Register Account	17](#heading=)

[UC-02 Submit Company Application	18](#heading=)

[UC-03 Approve Company	18](#heading=)

[UC-04 Invite Team Member	19](#heading=)

[UC-05 Accept Invitation	19](#heading=)

[UC-06 Create Export Case	19](#heading=)

[10\. Entity Relationship Diagram (ERD)	20](#heading=)

[Company	20](#heading=)

[User	20](#heading=)

[Invitation	20](#heading=)

[Relationships	21](#heading=)

[11\. Database Design (Cloud Firestore)	21](#heading=)

[Collections	21](#heading=)

[12\. System Architecture	21](#heading=)

[Authentication vs Authorization Split	22](#heading=)

[13\. RBAC Middleware Design	22](#heading=)

[13.1 Authentication Middleware (auth.go)	22](#heading=)

[13.2 Authorization Middleware (rbac.go)	23](#heading=)

[13.3 Tenant Middleware (tenant.go)	23](#heading=)

[13.4 Audit Middleware (audit.go)	23](#heading=)

[14\. Dashboard Design	23](#heading=)

[14.1 Guest Dashboard	23](#heading=)

[14.2 Admin Dashboard	23](#heading=)

[14.3 Company Owner Dashboard	24](#heading=)

[14.4 Export Manager Dashboard	24](#heading=)

[14.5 Finance Dashboard	24](#heading=)

[15\. Export Feasibility Scoring Model	24](#heading=)

[16\. Export Costing & Financial Analysis Formulas	25](#heading=)

[17\. Feature Prioritization	25](#heading=)

[18\. Release Plan	26](#heading=)

[19\. Acceptance Criteria	27](#heading=)

[20\. Assumptions & Constraints	28](#heading=)

[20.1 Assumptions	28](#heading=)

[20.2 Constraints	28](#heading=)

[21\. Resolved & Open Questions	28](#heading=)

[Resolved (as of v3.0)	28](#heading=)

[Open Questions	28](#heading=)

[Known Risks	29](#heading=)

[22\. Sequence Diagrams	29](#heading=)

[22.1 Guest Onboarding & Company Approval	29](#heading=)

[22.2 Team Invitation Flow	29](#heading=)

[22.3 Tenant-Scoped Export Case Access	30](#heading=)

## **Document Version History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| 1.0 | 10/06/2026 | WacanaTech | Initial draft |
| 1.1 | 14/06/2026 | WacanaTech | Revisions: stakeholders, in-scope, functional requirements, constraints |
| 1.2 | 16/06/2026 | WacanaTech | Adding out of scope |
| 2.0 | 23/06/2026 | WacanaTech | Initial PRD based on BRD v1.2 — user stories, acceptance criteria, feature prioritization, release plan |
| 2.1 | 25/06/2026 | WacanaTech | Resolved Incoterm costing formula and RAG knowledge base format |
| **3.0** | **25/06/2026** | **WacanaTech** | **Major architecture revision: multi-tenant SaaS, Firebase Auth, backend RBAC, company approval workflow, invitation-based team management, tenant data isolation** |

## **1\. Product Overview**

### **1.1 Purpose**

This Product Requirements Document (PRD) defines the features, user stories, acceptance criteria, and release plan for EXORA — a multi-tenant Export Feasibility & Decision Support Platform. It is derived from the Business Requirements Document (BRD) v1.2 and supersedes PRD v2.1 for all authentication, authorization, tenancy, and onboarding requirements.

### **1.2 Product Vision**

EXORA is a **multi-tenant AI-powered Export Decision Support Platform** that enables export companies to evaluate export opportunities through pricing analysis, profitability analysis, risk assessment, scenario comparison, and AI-assisted recommendations.

The platform supports:

* Company onboarding and approval workflow

* Multi-company management

* Role-based collaboration

* Secure tenant isolation

* AI-assisted export decision making

EXORA replaces fragmented manual export evaluation processes with a centralized, web-based decision-support platform where authorized company users can create export cases, calculate Incoterm-based pricing, analyze financial feasibility, assess risks, compare scenarios, and receive AI-powered recommendations — all within a single, structured interface with strict company-level data isolation.

### **1.3 Problem Statement**

Exporters — particularly SMEs — currently rely on spreadsheets and manual calculations to determine export pricing and profitability. This approach is:

* Time-consuming and prone to human error

* Inconsistent across different transactions and team members

* Unable to systematically compare Incoterm scenarios (EXW, FOB, CFR, CIF)

* Lacking structured risk assessment for country risk, payment term risk, and profitability risk

* Disconnected from export best practices and trade finance references

* Difficult to scale across multiple team members and companies without proper access control

### **1.4 Proposed Solution**

EXORA consolidates export costing, financial analysis, risk evaluation, scenario comparison, and AI-powered recommendations into one **multi-tenant SaaS platform**. Authentication is handled by **Firebase Authentication**; authorization, tenant isolation, and team management are enforced **server-side** by the Go backend through RBAC middleware. The platform uses a RAG-based AI Decision Advisor to provide contextual guidance while ensuring all calculations remain transparent, rule-based, and auditable.

### **1.5 Target Users**

| Role | Purpose |
| ----- | ----- |
| **Guest** | Register account, submit company application, track application status |
| **Company Owner** | Manage company profile and users; view export analytics and AI recommendations |
| **Export Manager** | Create export cases, maintain export data, run export analysis |
| **Finance Staff** | Manage costing, payment terms, review profitability |
| **Admin** | Approve companies, manage users, monitor platform |

## **2\. Stakeholders**

| Stakeholder | Role | Interest | Influence | Communication |
| ----- | ----- | ----- | ----- | ----- |
| Export Company Owner | Business Owner | High | Decision Maker | Monthly review & demo |
| Export Manager | Primary End User | High | Consulted | Weekly feedback session |
| Finance Staff | End User | High | Consulted | Bi-weekly review |
| Platform Admin | System Operator | High | Decision Maker | Weekly review |
| Project Supervisor | Academic Advisor | High | Consulted | Weekly progress report |
| Development Team | System Developer | High | Consulted | Daily standup |

## **3\. Product Scope**

### **3.1 In-Scope**

**Platform & Multi-Tenancy**

* Firebase Authentication: registration, login, logout, password reset, email verification

* Company application and admin approval workflow (pending / approved / rejected)

* Backend-managed RBAC with five roles: guest, company\_owner, export\_manager, finance\_staff, admin

* Invitation-based team management (Export Managers and Finance Staff cannot self-register)

* Multi-tenant data isolation at the backend layer

* Admin dashboard: company approvals, user management, system monitoring

* Audit logging for admin actions

**Export Decision Support (per company, tenant-isolated)**

* Export case creation, management, and history

* Export cost data management: HPP, packaging, certification, transportation, freight, insurance, exchange rates, target margins

* Incoterm pricing calculations: EXW, FOB, CFR, CIF

* Financial analysis: revenue, profit, margin, ROI, break-even analysis

* Scenario analysis: comparison across Incoterms, exchange rates, margins, and payment terms

* Risk assessment: country risk, payment term risk, profitability risk

* Export Feasibility Score (0–100) with classification: High / Moderate / Low

* AI Decision Advisor powered by RAG knowledge retrieval

* Role-based dashboards with backend-enforced data access

* Document generation: Quotation, Proforma Invoice, Cost Breakdown Report, Export Feasibility Report (PDF)

* Input validation with business rule warnings

### **3.2 Out-of-Scope**

* Account deactivation and permanent deletion (user disable supported; hard delete out of scope)

* Real-time freight rate, exchange rate, or customs duty integration

* International payment gateway integration

* Shipment tracking and logistics monitoring

* Buyer-facing portal or CRM functionality

* ERP, accounting, or third-party enterprise system integration

* Automated customs declaration submission

* Fully autonomous AI decision-making without user approval

* AI recommendation version history and audit tracking

* Document version control and revision history

* Multi-level approval workflows (single admin approval only)

* Self-registration for Export Managers and Finance Staff

* Frontend-only authorization or tenant filtering

## **4\. Functional Requirements**

### **Platform Requirements**

#### ***FR-001 Authentication***

Firebase Authentication shall support:

* Registration

* Login

* Logout

* Password Reset

* Email Verification

* **Email Verification Enforcement**: The backend shall validate that the user's email is verified before permitting access to protected resources (except onboarding endpoints).

* **Token Expiry & Refresh Handling**: The frontend client shall handle token expiration and automatically refresh tokens or handle refresh errors by redirecting the user to login.

* **Rate Limiting on Auth Endpoints**: Implement rate limiting on auth endpoints `/auth/register` and `/auth/login` to prevent brute-force attacks.

The backend shall create a linked user profile on first registration with role = guest and no company assignment until company application is submitted and approved.

#### ***FR-002 Company Application***

Guest users shall be able to:

* Submit company registration (company name, business sector, country)

* View approval status

Company status values: pending, approved, rejected.

Guest users **shall not** access export decision features.

#### ***FR-003 Company Approval***

Admin shall be able to:

* View pending company applications

* Approve application → user becomes company\_owner, company status \= approved

* Reject application → company status \= rejected

* Request revision → company remains pending with revision notes

#### ***FR-004 RBAC***

The backend shall enforce:

* Role validation on every protected endpoint

* Resource ownership validation

* Company ownership validation

Roles: guest, company\_owner, export\_manager, finance\_staff, admin.

#### ***FR-005 Invitation Management***

Company Owners shall:

* Invite Export Managers by email

* Invite Finance Staff by email

Invitations shall have status: pending, accepted, expired. Invitations must expire automatically after a configured TTL.

Export Managers and Finance Staff **must not** self-register.

#### ***FR-006 Multi-Tenant Isolation***

* Users shall only access data belonging to their company

* Admin may access all companies

* Cross-company access must be prevented at the backend layer

* All export resources (cases, costs, pricing, etc.) must include companyId

#### ***FR-007 Export Case Management***

* Export Managers may create and edit export cases within their company

* Company Owners may view all company export cases

* Finance Staff may view company export cases (read-only for case metadata)

* Admin may view all export cases across companies

#### ***FR-008 Financial Analysis***

* Finance Staff may manage cost data and view profitability analysis

* Company Owners may view financial analysis and profitability reports

* Export Managers may view pricing results tied to their cases

#### ***FR-009 AI Decision Advisor***

Authorized company users (company\_owner, export\_manager, finance\_staff) and Admin may:

* Generate AI recommendations for export cases within their scope

* View AI recommendations

Guest users shall not access the AI Advisor.

### **Export Engine Requirements (Retained from v2.1)**

| FR ID | Description |
| ----- | ----- |
| FR-010 | Export cost data input with validation and business-rule warnings |
| FR-011 | Incoterm pricing engine: EXW, FOB, CFR, CIF |
| FR-012 | Cost breakdown display per export case |
| FR-013 | Financial analysis: revenue, profit, margin, ROI, break-even |
| FR-014 | Scenario analysis and comparison |
| FR-015 | Risk assessment: country, payment term, profitability |
| FR-016 | Export Feasibility Score (0–100) with High/Moderate/Low classification |
| FR-017 | RAG knowledge retrieval from curated knowledge base |
| FR-018 | AI Decision Advisor recommendation generation |
| FR-019 | Role-based decision support dashboard (backend-filtered) |
| FR-020 | Quotation PDF generation |
| FR-021 | Proforma Invoice PDF generation |
| FR-022 | Export Feasibility Report PDF generation |
| FR-023 | Cost Breakdown Report PDF generation |
| FR-024 | Assumption modification and recalculation (simulation) |
| FR-025 | Export case history listing |
| FR-026 | Export case deletion |

## **5\. Non-Functional Requirements**

### **5.1 Performance**

| NFR ID | Description | Priority | Success Metric |
| ----- | ----- | ----- | ----- |
| NFR-001 | Dashboard pages shall load within 3 seconds | High | Page load ≤ 3s |
| NFR-002 | Export costing calculations shall complete within 5 seconds | High | Calculation response ≤ 5s |
| NFR-003 | AI recommendations shall be generated within 10 seconds | High | AI response ≤ 10s |

### **5.2 Security**

| NFR ID | Description | Priority | Success Metric |
| ----- | ----- | ----- | ----- |
| NFR-004 | Passwords shall be managed exclusively by Firebase Authentication; no passwords stored in application database | High | Verified via code review |
| NFR-005 | Access to export cases and financial data restricted to authenticated, authorized users | High | Unauthenticated requests return 401 |
| NFR-006 | Sensitive data protected during storage and transmission | High | TLS/HTTPS enabled |
| **NFR-011** | **Firebase ID Token must be validated on every protected request** | **High** | **401 on invalid/missing token** |
| **NFR-012** | **RBAC authorization must be enforced server-side** | **High** | **403 on role/permission violation** |
| **NFR-013** | **Cross-company access must be prevented** | **High** | **403 on tenant boundary violation** |
| **NFR-014** | **Invitations must expire automatically** | **Medium** | **Expired tokens rejected** |
| **NFR-015** | **Admin actions must be auditable** | **High** | **Audit log entries created** |

### **5.3 Availability**

| NFR ID | Description | Priority | Success Metric |
| ----- | ----- | ----- | ----- |
| NFR-007 | System maintains ≥ 95% availability during operational hours | High | Uptime ≥ 95% |

### **5.4 Usability**

| NFR ID | Description | Priority | Success Metric |
| ----- | ----- | ----- | ----- |
| NFR-008 | Users create export cases without technical training | Medium | Usability test pass |
| NFR-009 | Clear and intuitive UI for export costing and analysis | Medium | SUS score ≥ 70 |
| NFR-010 | Document generation within 3 clicks from dashboard | Medium | UX walkthrough verified |

## **6\. User Roles & Permissions**

### **Role Definition**

**type** UserRole \=  
  | "guest"  
  | "company\_owner"  
  | "export\_manager"  
  | "finance\_staff"  
  | "admin";

### **Guest**

**Permissions:** Register account, submit company information, view application status.

**Restrictions:** Cannot access export cases, analytics, or AI recommendations.

**Initial state after registration:** role \= guest, companyId \= null, company application status \= pending (after submission).

### **Admin**

**Permissions:** Review/approve/reject/request revision on company applications; manage users and roles; monitor system activity; access Admin Dashboard; access all companies.

### **Company Owner**

**Permissions:** Manage company profile; manage company users; invite Export Managers and Finance Staff; view all company export cases; view analytics; view AI recommendations.

**Granted when:** Admin approves company application (role changes from guest to company\_owner).

### **Export Manager**

**Permissions:** Create export cases; manage export information; view company export data.

**Onboarding:** Invitation only — cannot self-register.

### **Finance Staff**

**Permissions:** Manage cost calculations; manage payment terms; view profitability analysis; view financial reports.

**Onboarding:** Invitation only — cannot self-register.

## **7\. Permissions Matrix**

| Feature | Guest | Owner | Export Manager | Finance Staff | Admin |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Register | ✓ |  |  |  |  |
| Submit Company Application | ✓ |  |  |  |  |
| View Application Status | ✓ |  |  |  |  |
| Company Approval |  |  |  |  | ✓ |
| User Management |  | ✓ |  |  | ✓ |
| Invite Users |  | ✓ |  |  |  |
| Export Cases — View |  | ✓ | ✓ | ✓ | ✓ |
| Export Cases — Create/Edit |  |  | ✓ |  | ✓ |
| Cost Management |  |  |  | ✓ | ✓ |
| Financial Analysis |  | ✓ |  | ✓ | ✓ |
| Analytics |  | ✓ | ✓ | ✓ | ✓ |
| AI Advisor |  | ✓ | ✓ | ✓ | ✓ |
| System Monitoring |  |  |  |  | ✓ |

**Note:** All permissions are enforced **server-side**. Frontend UI filtering is supplementary only.

## **8\. User Stories**

### **8.1 Authentication & Onboarding**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-001 | High | As a Guest User, I want to register using Firebase Authentication so that I can access the platform. | Firebase registration succeeds; backend creates user with role \= guest; email verification sent. | FR-001 |
| US-002 | High | As a Guest User, I want to submit company information so that my company can be reviewed. | Company application saved with status pending; guest cannot access export features. | FR-002 |
| US-003 | High | As a Guest User, I want to track my application status. | Status displayed as pending/approved/rejected; revision notes shown when applicable. | FR-002 |
| US-004 | High | As an Admin, I want to approve company applications. | On approve: company status \= approved, applicant role \= company\_owner. | FR-003 |
| US-005 | High | As an Admin, I want to reject company applications. | On reject: company status \= rejected; applicant remains guest. | FR-003 |
| US-006 | Medium | As an Admin, I want to request revisions on company applications. | Revision notes saved; status remains pending; applicant notified. | FR-003 |

### **8.2 Team Management**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-007 | High | As a Company Owner, I want to invite Export Managers. | Invitation created with role export\_manager; email/link sent; expires per NFR-014. | FR-005 |
| US-008 | High | As a Company Owner, I want to invite Finance Staff. | Invitation created with role finance\_staff; email/link sent. | FR-005 |
| US-009 | High | As an invited user, I want to accept an invitation. | User registers/logs in via Firebase; linked to company with assigned role. | FR-005 |

### **8.3 Multi-Tenant Access**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-010 | High | As a Company Owner, I want to view only my company’s data. | API returns only company-scoped data; cross-company access returns 403\. | FR-006 |
| US-011 | High | As an Admin, I want to access all companies. | Admin can list and view data across all tenants. | FR-006 |

### **8.4 Export Case Management**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-012 | High | As an Export Manager, I want to create a new export case so I can evaluate a specific export opportunity. | Case created with companyId; appears in company case list. | FR-007 |
| US-013 | High | As an Export Manager, I want to input all export cost components. | Cost fields saved and validated; tenant isolation enforced. | FR-010 |
| US-014 | Medium | As an Export Manager, I want to view historical export cases. | Cases listed chronologically; scoped to company. | FR-025 |
| US-015 | Medium | As an Export Manager, I want to delete an export case I no longer need. | Case and associated data deleted within company scope. | FR-026 |

### **8.5 Pricing Calculation**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-016 | High | As an Export Manager, I want to see EXW selling price based on cost inputs and target margin. | EXW calculated per Section 9.1 formulas. | FR-011 |
| US-017 | High | As an Export Manager, I want to see FOB, CFR, and CIF selling prices. | All Incoterm prices calculated and displayed. | FR-011 |
| US-018 | High | As an Export Manager, I want a detailed cost breakdown per export case. | Breakdown lists all components with values. | FR-012 |

### **8.6 Financial Analysis**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-019 | High | As Finance Staff, I want to view financial metrics including revenue, profit, margin, ROI, and break-even. | Metrics calculated per documented formulas. | FR-013 |
| US-020 | Medium | As Finance Staff, I want to modify assumptions and recalculate projections. | Updated inputs trigger recalculation without duplicate case. | FR-024 |

### **8.7 Scenario Analysis**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-021 | High | As an Export Manager, I want to compare Incoterm scenarios side-by-side. | At least two scenarios compared with highlighted differences. | FR-014 |
| US-022 | High | As an Export Manager, I want to compare scenarios with different exchange rates, margins, and payment terms. | Impact on profitability and feasibility shown. | FR-014 |

### **8.8 Risk Assessment & Feasibility**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-023 | High | As a Company Owner, I want to see country, payment term, and profitability risk evaluations. | Risk levels displayed per scoring model. | FR-015 |
| US-024 | High | As a Company Owner, I want to see Export Feasibility Score with classification label. | Score uses 50/30/20 weighted model; label High/Moderate/Low. | FR-016 |

### **8.9 AI Decision Advisor**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-025 | High | As an authorized user, I want AI-generated recommendations based on export case analysis. | Recommendations contextually relevant; do not override user decision. | FR-017, FR-018 |
| US-026 | High | As an authorized user, I want the AI to retrieve relevant export best practices and country risk references. | RAG retrieval completes within 10 seconds. | FR-017 |

### **8.10 Dashboard & Documents**

| Story ID | Priority | User Story | Acceptance Criteria | Linked FR |
| ----- | ----- | ----- | ----- | ----- |
| US-027 | High | As an authorized user, I want a decision support dashboard showing pricing, profitability, risk, and scenario results. | Dashboard shows role-appropriate sections; data backend-filtered. | FR-019 |
| US-028 | High | As an Export Manager, I want to generate a Quotation PDF. | PDF generated with correct data; downloadable within 3 clicks. | FR-020 |
| US-029 | High | As an Export Manager, I want to generate a Proforma Invoice. | Proforma contains scenario-specific data. | FR-021 |
| US-030 | Medium | As a Company Owner, I want to generate an Export Feasibility Report. | Report includes metrics, risk scores, feasibility, AI recommendations. | FR-022 |

## **9\. Use Cases**

### **UC-01 Register Account**

**Actor:** Guest

**Precondition:** User has valid email address.

**Flow:**

1. User registers via Firebase Authentication (frontend)

2. Backend creates User record linked to firebaseUid

3. System assigns role \= guest, companyId \= null

4. User receives email verification

**Postcondition:** Guest user can log in and submit company application.

### **UC-02 Submit Company Application**

**Actor:** Guest

**Precondition:** User is authenticated with role \= guest.

**Flow:**

1. User fills company application form (companyName, businessSector, country)

2. User submits application

3. System creates Company record with status \= pending

4. Admin is notified (dashboard pending list)

**Postcondition:** Application visible to Admin; Guest can track status.

### **UC-03 Approve Company**

**Actor:** Admin

**Precondition:** Pending company application exists.

**Flow:**

1. Admin reviews application details

2. Admin approves application

3. System sets company status \= approved, approvedAt \= now

4. System updates applicant role \= company\_owner, links companyId

**Postcondition:** User becomes Company Owner with full company access.

**Alternate — Reject:**

1. Admin rejects with reason

2. Company status \= rejected

3. User remains guest

**Alternate — Request Revision:**

1. Admin adds revision notes

2. Company remains pending

3. Guest updates and resubmits

### **UC-04 Invite Team Member**

**Actor:** Company Owner

**Precondition:** User has role \= company\_owner and approved company.

**Flow:**

1. Owner enters invitee email and selects role (export\_manager or finance\_staff)

2. System generates invitation with unique token and expiry

3. Invitation link sent to invitee

**Postcondition:** Invitation record created with status \= pending.

### **UC-05 Accept Invitation**

**Actor:** Export Manager / Finance Staff (invitee)

**Precondition:** Valid pending invitation exists.

**Flow:**

1. Invitee opens invitation link

2. Invitee registers or logs in via Firebase Authentication

3. Backend validates token and expiry

4. User linked to company with assigned role

5. Invitation status \= accepted

**Postcondition:** User activated with company-scoped access.

### **UC-06 Create Export Case**

**Actor:** Export Manager

**Precondition:** User has role \= export\_manager and valid companyId.

**Flow:**

1. Export Manager creates export case

2. Backend validates role and company membership

3. Case saved with companyId

4. Case appears in company case list

**Postcondition:** Export case available for costing and analysis.

## **10\. Entity Relationship Diagram (ERD)**

### **Company**

| Field | Type | Notes |
| ----- | ----- | ----- |
| companyId | PK | Firestore document ID |
| companyName | string |  |
| businessSector | string |  |
| country | string |  |
| status | enum | pending, approved, rejected |
| submittedAt | timestamp |  |
| approvedAt | timestamp | nullable |

### **User**

Passwords are **not** stored in the application database (Firebase Authentication handles credentials).

| Field | Type | Notes |
| ----- | ----- | ----- |
| userId | PK | Internal ID |
| firebaseUid | string | Firebase Auth UID |
| email | string |  |
| displayName | string |  |
| role | enum | guest, company\_owner, export\_manager, finance\_staff, admin |
| companyId | FK | Nullable for guest and admin |
| status | enum | active, disabled |
| createdAt | timestamp |  |

### **Invitation**

| Field | Type | Notes |
| ----- | ----- | ----- |
| invitationId | PK |  |
| email | string | Invitee email |
| role | enum | export\_manager, finance\_staff |
| companyId | FK |  |
| token | string | Unique invitation token |
| status | enum | pending, accepted, expired |
| expiresAt | timestamp |  |
| createdAt | timestamp |  |

### **Relationships**

Company 1 ─── N User  
Company 1 ─── N Invitation  
Company 1 ─── N ExportCase  
User      N ─── N ExportCase (via company scope; Export Manager creates)

Users belong to exactly one company except guest and admin, which may have companyId \= NULL.

## **11\. Database Design (Cloud Firestore)**

### **Collections**

| Collection | Scope | Key Fields |
| ----- | ----- | ----- |
| companies | Platform | companyId, status, companyName |
| users | Platform | userId, firebaseUid, role, companyId |
| invitations | Company | invitationId, companyId, token, status, expiresAt |
| export\_cases | Company | caseId, companyId, createdBy |
| cost\_data | Company | caseId, companyId |
| pricing\_results | Company | caseId, companyId |
| financial\_analysis | Company | caseId, companyId |
| scenarios | Company | caseId, companyId |
| risk\_assessments | Company | caseId, companyId |
| advisor\_recommendations | Company | caseId, companyId |
| documents | Company | caseId, companyId |
| audit\_logs | Platform | action, actorId, targetId, timestamp |

All company-scoped collections **must** include companyId for tenant middleware validation.

## **12\. System Architecture**

\+----------------------+  
|      Next.js         |  
|      Frontend        |  
|  Firebase Auth SDK   |  
\+----------+-----------+  
           |  
           | Firebase ID Token  
           v  
\+----------------------+  
| Firebase Auth        |  
| (Registration,       |  
|  Login, Session)     |  
\+----------------------+  
           |  
           v  
\+----------------------+  
| Go REST API          |  
|                      |  
| Auth Middleware      |  ← Verify Firebase ID Token, load user profile  
| RBAC Middleware      |  ← Validate role & permissions  
| Tenant Middleware    |  ← Validate companyId & resource ownership  
| Audit Middleware     |  ← Log admin actions  
\+----------+-----------+  
           |  
           v  
\+----------------------+  
| Cloud Firestore      |  
| (Multi-tenant data)  |  
\+----------------------+  
           |  
           v  
\+----------------------+  
| Gemini AI \+ RAG      |  
| (Knowledge Base)     |  
\+----------------------+

### **Authentication vs Authorization Split**

| Responsibility | Handled By |
| ----- | ----- |
| User registration, login, logout | Firebase Authentication |
| Password reset, email verification | Firebase Authentication |
| Session management | Firebase Authentication |
| Role validation | Go Backend (RBAC Middleware) |
| Company ownership validation | Go Backend (Tenant Middleware) |
| Data access control | Go Backend (Tenant \+ RBAC Middleware) |
| Invitation management | Go Backend |
| Multi-tenant access control | Go Backend |

## **13\. RBAC Middleware Design**

### **13.1 Authentication Middleware (auth.go)**

**Responsibilities:**

* Verify Firebase ID Token from Authorization: Bearer \<token\> header

* Extract firebaseUid

* Load User profile from Firestore

* Reject disabled users

### **13.2 Authorization Middleware (rbac.go)**

**Responsibilities:**

* Validate user role against required roles for endpoint

* Validate permission matrix

**Example:**

RequireRoles("admin", "company\_owner")

### **13.3 Tenant Middleware (tenant.go)**

**Responsibilities:**

* Validate user.companyId matches resource companyId

* Allow Admin bypass for cross-company access

* Block Guest from export endpoints

**Example:**

*// exportCase.companyId \== user.companyId*  
*// OR user.role \== "admin"*

### **13.4 Audit Middleware (audit.go)**

**Responsibilities:**

* Log admin actions to audit\_logs collection

* Capture: actor, action, target, timestamp, metadata

## **14\. Dashboard Design**

### **14.1 Guest Dashboard**

* Company Application Form

* Application Status Tracker

### **14.2 Admin Dashboard**

**Company Approvals Module**

* Pending applications list

* Approve / Reject / Request Revision actions

* Application detail view

**User Management Module**

* Create, edit, disable, delete users

* Change user roles

**System Monitoring Module**

* Total companies, users, export cases

* Pending approvals count

* Active users

* User activity statistics

### **14.3 Company Owner Dashboard**

* Company Profile

* Team Management (invitations)

* Export Analytics (all company cases)

* AI Recommendations overview

### **14.4 Export Manager Dashboard**

* Export Cases (create, edit, list)

* Pricing

* Scenario Analysis

* Risk Assessment

### **14.5 Finance Dashboard**

* Costing

* Financial Analysis

* Profitability Reports

## **15\. Export Feasibility Scoring Model**

*(Unchanged from v2.1 — see Section 9.1 formulas below)*

| Factor | Weight | Scoring Criteria |
| ----- | ----- | ----- |
| Profitability Score | 50% | ≥target: 100 | 80–99%: 75 | 50–79%: 50 | \<50%: 25 |
| Country Risk Score | 30% | Low: 100 | Medium: 70 | High: 30 |
| Payment Term Risk Score | 20% | LC: 100 | TT: 80 | Doc. Collection: 60 | OA: 30 |

| Score Range | Feasibility Level |
| ----- | ----- |
| 80 – 100 | High Feasibility |
| 60 – 79 | Moderate Feasibility |
| 0 – 59 | Low Feasibility |

## **16\. Export Costing & Financial Analysis Formulas**

*(Retained from PRD v2.1 Section 6.1 — official business rules)*

All calculations in IDR; exchange rate applied only for final USD conversion.

**Incoterm Cost (cumulative, IDR):**

EXW Cost \= HPP \+ Packaging \+ Certification  
FOB Cost \= EXW Cost \+ Transportation  
CFR Cost \= FOB Cost \+ Freight  
CIF Cost \= CFR Cost \+ Insurance

**Margin (independent per Incoterm):**

EXW Margin \= EXW Cost × Target Margin %  
(same pattern for FOB, CFR, CIF)

**Selling Price:**

EXW Price (IDR) \= EXW Cost \+ EXW Margin  
Selling Price (USD) \= Selling Price (IDR) ÷ Exchange Rate

**Financial Metrics:**

Revenue (IDR) \= Selected Incoterm Price (IDR) × Quantity  
Gross Profit (IDR) \= Revenue (IDR) − Total Export Cost (IDR)  
Profit Margin (%) \= (Gross Profit ÷ Revenue) × 100  
ROI (%) \= (Gross Profit ÷ Total Export Cost) × 100

## **17\. Feature Prioritization**

| Feature ID | Feature Name | Priority | Phase | Linked FR(s) |
| ----- | ----- | ----- | ----- | ----- |
| F-001 | Firebase Auth \+ Backend User Sync | Must Have | Phase 1 | FR-001 |
| F-002 | Company Application & Approval Workflow | Must Have | Phase 1 | FR-002, FR-003 |
| F-003 | Backend RBAC \+ Tenant Middleware | Must Have | Phase 1 | FR-004, FR-006 |
| F-004 | Invitation Management | Must Have | Phase 1 | FR-005 |
| F-005 | Admin Dashboard (Approvals, Users, Monitoring) | Must Have | Phase 1 | FR-003, FR-004 |
| F-006 | Export Case Management (CRUD, tenant-scoped) | Must Have | Phase 1 | FR-007, FR-025, FR-026 |
| F-007 | Export Cost Data Input & Validation | Must Have | Phase 2 | FR-010 |
| F-008 | Incoterm Pricing Engine | Must Have | Phase 2 | FR-011, FR-012 |
| F-009 | Financial Analysis Module | Must Have | Phase 2 | FR-013 |
| F-010 | Scenario Analysis & Comparison | Must Have | Phase 2 | FR-014 |
| F-011 | Risk Assessment \+ Feasibility Scoring | Must Have | Phase 2 | FR-015, FR-016 |
| F-012 | RAG Knowledge Retrieval | Must Have | Phase 3 | FR-017 |
| F-013 | AI Decision Advisor | Must Have | Phase 3 | FR-018 |
| F-014 | Role-Based Dashboard (backend-filtered) | Must Have | Phase 3 | FR-019 |
| F-015 | PDF Document Generation | Must Have | Phase 4 | FR-020–FR-023 |
| F-016 | Assumption Modification & Recalculation | Should Have | Phase 4 | FR-024 |

## **18\. Release Plan**

| Phase | Timeline | Features / Deliverables | Milestone |
| ----- | ----- | ----- | ----- |
| Phase 1 — Platform Foundation | Week 1–2 | Firebase Auth, user sync, company application, admin approval, RBAC/tenant middleware, invitation flow, admin dashboard | Multi-tenant platform ready |
| Phase 2 — Core Engine | Week 3–4 | Export costing, pricing, financial analysis, scenario comparison, risk assessment | Calculation modules operational |
| Phase 3 — AI & Intelligence | Week 5–6 | AI Advisor, RAG retrieval, feasibility scoring, role-based dashboards | AI advisor integrated |
| Phase 4 — Documents & Polish | Week 7 | PDF generators, validation, team management polish | Document generation complete |
| Phase 5 — Testing & Release | Week 8 | System testing, security testing (tenant isolation), documentation, demo | Production release |

---

## **19\. Acceptance Criteria**

| AC ID | Criterion |
| ----- | ----- |
| AC-001 | All platform FR-001 to FR-009 and export FR-010 to FR-026 implemented and tested |
| AC-002 | Guest onboarding flow works: register → apply → pending → approve → company\_owner |
| AC-003 | Export Managers and Finance Staff cannot self-register; invitation flow works end-to-end |
| AC-004 | Cross-company data access returns 403; tenant isolation verified |
| AC-005 | RBAC enforced server-side on all protected endpoints |
| AC-006 | EXW/FOB/CFR/CIF pricing correct per Section 16 formulas |
| AC-007 | Financial analysis accurate and consistent |
| AC-008 | Risk assessment and Feasibility Score match weighted model |
| AC-009 | AI Advisor retrieves RAG knowledge and generates contextual recommendations |
| AC-010 | PDF documents generated successfully |
| AC-011 | All NFR-001 to NFR-015 validated |
| AC-012 | Admin actions logged in audit\_logs |
| AC-013 | User documentation complete; stakeholder approval obtained |

## **20\. Assumptions & Constraints**

### **20.1 Assumptions**

* Users have basic knowledge of export costing concepts

* Initial RAG knowledge base covers 10 destination markets (Singapore, Malaysia, Thailand, Vietnam, China, India, Japan, South Korea, United States, UAE)

* Firebase project configured with email/password authentication

* One Company Owner per approved company (MVP)

* Users have stable internet connectivity

### **20.2 Constraints**

* 8-week academic project timeline

* Budget limited to free/educational tier services

* Real-time external data integration out of scope

* AI recommendations are decision support only

* RAG knowledge base manually curated

## **21\. Resolved & Open Questions**

### **Resolved (as of v3.0)**

| Question | Resolution |
| ----- | ----- |
| Multi-user access per company? | **Yes.** Multi-tenant with invitation-based team management. |
| Who can register as Export Manager? | **Nobody self-registers.** Company Owner invites only. |
| Where is RBAC enforced? | **Backend server-side** via auth, RBAC, and tenant middleware. |
| Dashboard filtering location? | **Backend** returns role-appropriate, tenant-scoped data. |
| Incoterm formula? | Resolved in v2.1 — retained in Section 16\. |
| Knowledge base format? | JSON per entity — retained from v2.1. |

### **Open Questions**

* Which email service delivers invitation links in production?

* Default invitation expiry TTL (recommended: 7 days)?

* Admin user bootstrap: how is the first admin account created?

### **Known Risks**

* RAG knowledge base quality impacts AI recommendation relevance

* Free-tier hosting may introduce cold start latency (NFR-001, NFR-002)

* Firebase email delivery reliability for verification and invitations

* Tenant isolation bugs are high-severity — requires dedicated security testing in Phase 5

## **22\. Sequence Diagrams**

### **22.1 Guest Onboarding & Company Approval**

sequenceDiagram  
    participant G as Guest (Frontend)  
    participant FA as Firebase Auth  
    participant API as Go Backend  
    participant FS as Firestore  
    participant A as Admin

    G-\>\>FA: Register (email/password)  
    FA--\>\>G: Firebase UID \+ ID Token  
    G-\>\>API: POST /auth/register (ID Token)  
    API-\>\>FS: Create User (role=guest)  
    API--\>\>G: User profile

    G-\>\>API: POST /companies/apply  
    API-\>\>FS: Create Company (status=pending)  
    API--\>\>G: Application submitted

    A-\>\>API: GET /admin/company-applications  
    API--\>\>A: Pending list

    A-\>\>API: POST /admin/company-applications/{id}/approve  
    API-\>\>FS: Company status=approved  
    API-\>\>FS: User role=company\_owner, companyId set  
    API--\>\>A: Approved

### **22.2 Team Invitation Flow**

sequenceDiagram  
    participant O as Company Owner  
    participant API as Go Backend  
    participant FS as Firestore  
    participant I as Invitee  
    participant FA as Firebase Auth

    O-\>\>API: POST /users/invite (email, role)  
    API-\>\>FS: Create Invitation (token, expiresAt)  
    API--\>\>O: Invitation link

    I-\>\>API: GET invitation by token  
    I-\>\>FA: Register or Login  
    FA--\>\>I: ID Token  
    I-\>\>API: POST /invitations/{token}/accept  
    API-\>\>FS: Link user to company, set role  
    API-\>\>FS: Invitation status=accepted  
    API--\>\>I: Activated

### **22.3 Tenant-Scoped Export Case Access**

sequenceDiagram  
    participant U as Export Manager  
    participant API as Go Backend  
    participant Auth as Auth Middleware  
    participant RBAC as RBAC Middleware  
    participant Tenant as Tenant Middleware  
    participant FS as Firestore

    U-\>\>API: GET /export-cases/{caseId} (ID Token)  
    Auth-\>\>Auth: Verify Firebase token, load user  
    RBAC-\>\>RBAC: Check role allows access  
    Tenant-\>\>FS: Load export case  
    Tenant-\>\>Tenant: case.companyId \== user.companyId?  
    alt Match  
        Tenant--\>\>U: 200 Case data  
    else Mismatch  
        Tenant--\>\>U: 403 FORBIDDEN  
    end

*End of PRD v3.0*

