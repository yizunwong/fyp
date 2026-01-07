# Backend Code Evidence Index

**Project:** Blockchain-Based Agricultural Traceability and Subsidy Automation Platform

**Backend Stack:** NestJS, Prisma (PostgreSQL), Ethereum Smart Contracts

**Purpose:** Identify core backend source files for FYP code screenshot evidence

---

## 1. Authentication & Authorization

### Name of Program:

**auth.service.ts**

- **Directory:** `backend/src/api/auth/auth.service.ts`
- **Purpose:** Handles user authentication, JWT generation, password hashing, OAuth login, and role-based access control.
- **Core Logic Line Range:** `Lines 49 – 104` (User validation, JWT token generation, login flow)
- **Additional Sections:**
  - `Lines 106 – 143` (User registration with email verification)
  - `Lines 146 – 217` (OAuth login with provider linking)
  - `Lines 413 – 462` (Password reset workflow)

---

## 2. Farm Management

### Name of Program:

**farm.service.ts**

- **Directory:** `backend/src/api/farm/farm.service.ts`
- **Purpose:** Implements farm registration, ownership validation, document IPFS upload, verification status management, and farm document synchronization.
- **Core Logic Line Range:** `Lines 109 – 132` (Farm creation with Prisma)
- **Additional Sections:**
  - `Lines 238 – 274` (Farm verification status update with notification)
  - `Lines 499 – 570` (Document upload to IPFS and sync)
  - `Lines 572 – 601` (Land document verification status management)

### Name of Program:

**farm.controller.ts**

- **Directory:** `backend/src/api/farm/farm.controller.ts`
- **Purpose:** Exposes REST endpoints for farm operations with role-based guards (FARMER, GOVERNMENT_AGENCY, ADMIN).
- **Core Logic Line Range:** `Lines 50 – 68` (Document upload endpoint with guards)
- **Additional Sections:**
  - `Lines 70 – 80` (Farm verification status update endpoint)
  - `Lines 82 – 119` (Document verification status update endpoint)
  - `Lines 121 – 134` (List pending farms endpoint)

---

## 3. Produce / Batch Management

### Name of Program:

**produce.service.ts**

- **Directory:** `backend/src/api/produce/produce.service.ts`
- **Purpose:** Handles produce batch creation, blockchain recording, QR code generation, status transition validation, retailer assignment, and on-chain verification.
- **Core Logic Line Range:** `Lines 434 – 560` (Create produce with blockchain integration, QR generation, hash computation)
- **Additional Sections:**
  - `Lines 235 – 266` (Status transition validation with business rules)
  - `Lines 562 – 625` (Retailer assignment with status checks)
  - `Lines 627 – 690` (Mark produce arrival workflow)
  - `Lines 734 – 779` (Blockchain hash verification logic)
  - `Lines 822 – 902` (Retailer verification with on-chain validation)
  - `Lines 1193 – 1237` (Background polling for blockchain confirmations)

---

## 4. Subsidy Program Management (Agency)

### Name of Program:

**program.service.ts**

- **Directory:** `backend/src/api/program/program.service.ts`
- **Purpose:** Manages subsidy program creation with eligibility rules, payout rules, status transitions, and farmer enrollment.
- **Core Logic Line Range:** `Lines 26 – 81` (Program creation with eligibility and payout rules)
- **Additional Sections:**
  - `Lines 206 – 263` (Program status update with business rule validation)
  - `Lines 281 – 338` (Farmer enrollment with notification)

---

## 5. Subsidy Claim Processing

### Name of Program:

**subsidy.service.ts**

- **Directory:** `backend/src/api/subsidy/subsidy.service.ts`
- **Purpose:** Implements subsidy claim submission, approval workflow, disbursement status management, and evidence upload (IPFS/Cloudinary).
- **Core Logic Line Range:** `Lines 29 – 126` (Subsidy request creation with program validation)
- **Additional Sections:**
  - `Lines 406 – 486` (Subsidy approval with status transition)
  - `Lines 498 – 578` (Subsidy disbursement workflow)
  - `Lines 580 – 639` (Evidence upload with IPFS/Cloudinary routing)

---

## 6. Retailer Verification Workflow

### Name of Program:

**retailer.service.ts**

- **Directory:** `backend/src/api/retailer/retailer.service.ts`
- **Purpose:** Handles retailer profile listing with user information.
- **Core Logic Line Range:** `Lines 8 – 22` (List retailers with profile joins)

**Note:** Retailer verification logic is primarily in `produce.service.ts` (retailerVerifyProduce method).

---

## 7. User Management (Admin)

### Name of Program:

**user.service.ts**

- **Directory:** `backend/src/api/user/user.service.ts`
- **Purpose:** Manages user creation with role-based profile provisioning (Farmer, Retailer, Government Agency), user updates, and role transitions.
- **Core Logic Line Range:** `Lines 85 – 162` (Create user with role-based profile creation in transaction)
- **Additional Sections:**
  - `Lines 204 – 236` (Get user by ID with role-specific profile data)
  - `Lines 384 – 578` (Update user with role-specific profile handling)
  - `Lines 589 – 621` (Prisma error handling for unique constraints)

---

## 8. Report Generation

### Name of Program:

**report.service.ts**

- **Directory:** `backend/src/api/report/report.service.ts`
- **Purpose:** Generates PDF reports with filtering, data aggregation, and asynchronous PDF generation workflow.
- **Core Logic Line Range:** `Lines 69 – 102` (Create report with async PDF generation)
- **Additional Sections:**
  - `Lines 107 – 144` (PDF generation with status updates)

---

## 9. File Upload & Media Handling

### Name of Program:

**cloudinary.service.ts**

- **Directory:** `backend/src/api/cloudinary/cloudinary.service.ts`
- **Purpose:** Handles file uploads to Cloudinary for farm documents, produce images, and subsidy evidence.
- **Core Logic Line Range:** `Lines 20 – 49` (Image upload with folder organization)
- **Additional Sections:**
  - `Lines 68 – 97` (Generic file upload with auto resource type)

---

## 10. Blockchain Integration

### Name of Program:

**blockchain.service.ts**

- **Directory:** `backend/src/blockchain/blockchain.service.ts`
- **Purpose:** Interfaces with Ethereum smart contracts for produce recording, hash retrieval, and transaction confirmation.
- **Core Logic Line Range:** `Lines 86 – 104` (Record produce on blockchain with transaction handling)
- **Additional Sections:**
  - `Lines 60 – 84` (Contract initialization and provider setup)
  - `Lines 106 – 119` (Get produce hash from blockchain)
  - `Lines 120 – 130` (Confirm on-chain transaction status)

---

## Notes

- Only core business logic files are included.
- Line ranges are selected to maximise clarity for screenshot-based documentation.
- DTOs and boilerplate files are excluded unless necessary.
- Controllers show REST API endpoint definitions with guards and decorators.
- Services demonstrate business rule enforcement, database transactions, and external service integration.
