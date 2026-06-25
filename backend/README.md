# Exora Backend (API v2)

Go 1.22 REST API — layered, domain-grouped, multi-tenant. Implements **API Contract v2**.

## Auth Flow

1. **Frontend**: Firebase Auth SDK handles register/login/logout/reset.
2. **Frontend**: Sends `Authorization: Bearer <Firebase ID Token>` on every API call.
3. **Backend**: Verifies token → loads/creates Firestore profile → enforces RBAC + tenant rules.
4. **Frontend**: Uses `GET /v1/users/me` for `role` / `companyId` navigation (never trust client-assigned roles).

## Base URL

- Local: `http://localhost:8080/v1`
- Prod: `https://api.exora.app/v1`

## Response Format

Success:
```json
{ "success": true, "data": { } }
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "companyName", "issue": "required" }]
  }
}
```

## Roles

`guest` | `company_owner` | `export_manager` | `finance_staff` | `admin`

## Quick Start

```bash
cp .env.example .env
# Set FIRESTORE_PROJECT_ID, FIREBASE_CREDENTIALS_PATH, GEMINI_API_KEY
go run ./cmd/api
```

## Key Endpoints

| Method | Path | Roles |
|--------|------|-------|
| POST | `/v1/auth/register` | authenticated (new user → `guest`) |
| POST | `/v1/auth/login` | authenticated |
| GET | `/v1/users/me` | authenticated |
| POST | `/v1/companies/apply` | guest |
| GET | `/v1/admin/company-applications` | admin |
| POST | `/v1/users/invite` | company_owner |
| GET | `/v1/invitations/{token}` | public |
| CRUD | `/v1/export-cases` | tenant-scoped + role RBAC |
| GET | `/v1/analytics` | role-filtered backend aggregates |

Export sub-resources (cost-data, pricing, financial-analysis, scenarios, risk, advisor, documents) are mounted under `/v1/export-cases/{caseId}/...`.

## Tenant Rule

Resources with `companyId` reject access when `user.companyId != resource.companyId`, except `admin`.

## Docker

```bash
docker build -t exora-api .
docker run -p 8080:8080 --env-file .env exora-api
```
