# LabLens - Future Work, Missing Features & Roadmap Backlog
> **Document Purpose:** Complete audit and work-distribution breakdown for LabLens. Use this document to divide tasks across team members for project evaluation, academic grading defense, and real-world clinical usability.

---

## 0. Academic & Architecture Requirements: Express.js & MongoDB Alignment
Your project is built on the **MERN** stack (**M**ongoDB, **E**xpress.js, **R**eact, **N**ode.js). Here is how Express and MongoDB are currently utilized, and what must be highlighted/hardened for your professor's evaluation:

### Express.js Architecture
- **Layered MVC Pattern:** Clean separation of concerns with Routes (`server/routes/`), Controllers (`server/controllers/`), Middleware (`server/middleware/`), and Utilities (`server/utils/`).
- **RESTful Endpoints:** Standardized HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`) with HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`).
- **Middleware Pipeline:**
  - `authMiddleware.js`: JWT signature verification, role-based authorization (`requireRole('doctor')`, `requireRole('patient')`), and patient onboarding completion guard (`requireProfile`).
  - `errorMiddleware.js`: Centralized application error handling and formatting.
  - `loggerMiddleware.js`: Non-blocking asynchronous request logging (sanitized to avoid logging medical bodies or passwords).
  - Rate Limiting: `express-rate-limit` to protect authentication endpoints against brute force attacks.
- **Academic Requirement / To Add for Evaluation:**
  - Input validation using `express-validator` to demonstrate robust server-side schema validation to your professor.
  - Comprehensive API documentation (or an exportable Postman collection) demonstrating all Express routes.

### MongoDB & Mongoose Schema Architecture
- **Mongoose ODM:** Defines strictly typed Schemas with constraints, validation, and compound indexes:
  - `User.js`: Base account schema, bcrypt password hashing pre-save hooks, role enum (`patient`, `doctor`), sparse unique index on `doctorCode`.
  - `PatientProfile.js`: Relational reference (`ref: 'User'`), physiological vitals (height, weight, waist, hip), medical history, and lifestyle factors.
  - `DoctorProfile.js`: Relational reference (`ref: 'User'`), medical license number, specialty, and clinic affiliation.
  - `Link.js`: Relational junction collection for doctor-patient connections with **compound unique index** (`{ doctor: 1, patient: 1 }`) ensuring no duplicate link records.
  - `Report.js`: Embedded subdocuments (`parameters: [parameterSchema]`) capturing clinical biomarker measurements, panels, and severity classifications.
  - `ParameterReference.js`: Medical reference intervals, aliases, age/sex thresholds, and clinical advice text.
- **Academic Requirement / To Add for Evaluation:**
  - **Persistent MongoDB Connection:** Currently, if `MONGODB_URI` is omitted from `server/.env`, the server boots an ephemeral `mongodb-memory-server` for zero-setup execution. **For teacher evaluation, set up a persistent MongoDB instance** (either MongoDB Atlas URI or a local `mongodb://localhost:27017/lablens` database) in `server/.env` so test data remains persistent across restarts.
  - **MongoDB Aggregation Pipelines:** Showcase MongoDB's query power to your evaluator by adding an aggregation pipeline (e.g. `$group` by panel, `$avg` biomarker calculations over time) rather than doing all aggregation in JavaScript.

---

## Module 1: The Public Landing Page & Route Restructuring (High Priority)
*Status: Partially requested / Not implemented in the codebase yet.*

### What is Missing & Needs to be Done:
1. **Public Landing Page (`client/src/pages/LandingPage.jsx`)**:
   - Clean, high-converting hero matching the UI reference: pill badge (`"Your blood reports, finally understood"`), headline, descriptive subtext, CTA buttons (`"Create Free Account"` -> `/register`, `"Try Demo Account"`).
   - Interactive SVG Health Score ring (e.g. 87/100) and mini vitals chips (Thyroid: Concern in red, Cholesterol: Concern, Kidney: Looks good in green, Liver: Looks good).
   - Sample critical parameter preview card.
2. **Sub-Hero & Information Sections**:
   - 3 Feature Cards: *"Understand every result"*, *"Track trends"*, *"Share with your doctor"*.
   - **#how-it-works**: 3-step timeline (1. Create profile -> 2. Add blood report -> 3. Get smart analysis).
   - **#features**: 2x3 grid showcasing Health Score, 10 Body Systems, Critical Biomarkers, Panel Grouping, Trends/Compare, and Biomarker Guide.
   - **For Patients vs. For Doctors**: 2-column comparative section with pre-filled registration triggers (`/register?role=patient` vs `/register?role=doctor`) and static preview of doctor patient roster.
   - **#security**: Transparent, non-exaggerated security facts (hashed passwords, explicit doctor linking, instant unlinking).
   - Dedicated landing header (smooth scroll anchors, login/register CTA) and clean medical disclaimer footer.
3. **Route Migration & Cleanup (`App.jsx`, `Navbar.jsx`)**:
   - Move `/` to serve the public landing page.
   - Patient dashboard must move from `/` to `/dashboard`.
   - Update all navbar links, back buttons, redirects, and protected routes to point to `/dashboard` for patients and `/doctor` for doctors.
   - Auto-redirect authenticated users visiting `/` to their respective portal.
   - Ensure the main app `Navbar` is completely hidden on `/` and for unauthenticated guests.

---

## Module 2: Report Comparison & Biomarker Reference Guide
*Status: Missing views shown in design references.*

### What is Missing & Needs to be Done:
1. **Report Comparison View ("Compare Reports")**:
   - Dedicated tab or sub-page on `/trends/compare` or `/reports/compare`.
   - Dropdown selectors to pick two dates/reports: `Earlier Report` vs `Later Report`.
   - Comparison matrix table showing:
     - Biomarker Name & Unit
     - Earlier Value vs Later Value
     - Absolute & Percentage Change (`+12.5%`, `-7.8%`) with color-coded directional arrows (`▲`, `▼`)
     - Movement visual progress bars
     - Current clinical status pill (Normal / High / Low)
   - Summary insight callouts:
     - Positive changes: e.g. *"Improved: hemoglobin, HDL, triglycerides, cholesterol."*
     - Watch/Alert changes: e.g. *"Watch: fasting blood sugar is trending upward."*
2. **Interactive Biomarker Guide (`/guide`)**:
   - Public/in-app medical literacy guide explaining routine biomarkers in layman's terms.
   - Category filtering pills: `All`, `Blood Count`, `Sugar`, `Lipids`, `Liver`, `Kidney`, `Thyroid`.
   - Live search input filtering across canonical names and common aliases.
   - Biomarker cards displaying:
     - Plain-language description (e.g. *"Protein in red blood cells that carries oxygen. Low levels may indicate anemia."*)
     - Standard reference intervals by gender/age.
     - Direct linkage to the existing `ParameterReference` database.

---

## Module 3: Evaluator & Clinical Audit Perspective (Edge Cases & Gaps)
*Status: Common grading checks and questions teachers/evaluators ask during presentations.*

### What an Evaluator Will Test and Find:
1. **MongoDB Connection & Data Persistence**:
   - Demonstrate a real MongoDB database (MongoDB Compass or MongoDB Atlas dashboard) with actual collections: `users`, `reports`, `patientprofiles`, `doctorprofiles`, `links`, and `parameterreferences`.
2. **Express Middleware Verification**:
   - Demonstrate unauthorized request handling: What happens when an unauthenticated request hits `/api/reports`? (Returns `401`).
   - What happens when a patient tries to hit a doctor route like `/api/patients`? (Returns `403 Forbidden`).
3. **Missing Input Validation & Boundary Checks**:
   - Patient date of birth: Can someone register as 150 years old or enter future dates?
   - Height/Weight: Can negative or zero values break the BMI calculation (causing `NaN` or `Infinity` in the advisory)?
   - Numeric vs Text biomarkers: Ensure urine analysis parameters (e.g., protein `Trace`, `1+`) do not fail numeric conversions or cause crashes in trend charts.
4. **Doctor Access Matrix Testing**:
   - Can a doctor manually change the URL `/reports/:id` to view an unlinked patient's report? (Make sure the backend returns 403 Forbidden and the frontend renders an authorized error page instead of breaking).
   - What happens when a link is revoked while a doctor is viewing a patient? Does the next query immediately block access?
5. **Print & PDF Export Quality**:
   - Evaluators test the "Print / Save PDF" button. Ensure browser print preview produces a neat 1-2 page clinical summary without broken page breaks, missing CSS backgrounds, or clipped tables.

---

## Module 4: PDF / Image Lab Report Upload & Auto-Extraction
*Status: Not implemented yet (Currently reports are entered via smart manual forms & panel presets).*

### Current vs. Future State:
- **Currently:** Patients add blood tests manually using `/add-report`, where they pick panel templates (CBC, Lipid, Metabolic, etc.) and type in values, which then triggers the **Smart Analysis Engine** (`healthScore`, 10-system vitals grid, severity grading, and rule-based advice).
- **What is Missing (PDF/Image OCR):** Patients cannot currently upload a PDF or photo of their lab report to have the values extracted automatically.

### What Needs to be Built for PDF Extraction:
1. **Backend File Handling (`server/routes/reports.js` & `server/controllers/uploadController.js`)**:
   - Install file upload middleware: `multer` for receiving multipart/form-data PDFs or images.
   - Restrict uploads to `.pdf`, `.png`, `.jpg` with size limits (e.g., max 5MB).
2. **Text Extraction & Parsing Pipeline**:
   - **Option A (Local Parsing):** Use `pdf-parse` or `pdf2json` to extract raw text streams from PDF files.
   - **Option B (AI / Vision Extraction):** Use a Gemini / OCR API parser to convert unstructured lab test text/tables into structured JSON matching the `parameters` schema (`name`, `value`, `unit`, `normalRangeLow`, `normalRangeHigh`).
3. **Frontend Upload Dropzone (`client/src/pages/AddReportPage.jsx` or `/upload`)**:
   - Drag-and-drop file upload zone ("Drop your lab report PDF here").
   - Review & Confirmation Step: Extracted biomarkers appear in an editable preview table so the patient can verify values before saving.
   - Save directly into MongoDB via the existing `POST /api/reports` endpoint, instantly calculating the Health Score and Smart Analysis.

---

## Module 5: Real-World Patient User Journey (UX Enhancements)
*Status: Opportunities to make the app feel like a polished, commercial health platform.*

### What Patients Need:
1. **Interactive Report Creation & Smart Autofill**:
   - Autocomplete dropdown when typing biomarker names in `AddReportPage` that pulls from `ParameterReference`.
   - Instant reference range population based on patient profile sex and age.
   - Validation warning when entered values are physiologically implausible (e.g., entering Hemoglobin = 140 instead of 14.0).
2. **Notification & Link Request Feedback**:
   - Visual status badges on the patient profile: *"Pending Doctor Approval"*, *"Linked with Dr. Sarah Jenkins"*, *"Revoked"*.
   - Alert toast when a doctor accepts or rejects a link request.
3. **Medical Disclaimer & Safety Framing**:
   - Clear banner stating: *"LabLens is an informational educational tool, not a diagnostic medical device. Consult a physician before changing medication or diet."*
4. **Export & Sharing**:
   - Quick "Download Summary as PDF" or copy shareable doctor code.

---

## Module 6: Real-World Doctor User Journey (Clinical Efficiency)
*Status: Features that make the doctor portal genuinely useful in a clinic.*

### What Doctors Need:
1. **Patient Roster Enhancements (`/doctor`)**:
   - Badge filters: `Show All`, `Critical Only`, `Recently Updated`.
   - Quick search by patient name, email, or flagged biomarker condition.
2. **Doctor Clinical Notes**:
   - Ability for a doctor to attach private clinical remarks or recommendations to a patient's report that the patient can read.
3. **Batch Review / Triage Mode**:
   - Flagging patients needing immediate repeat testing or follow-up consultation.
4. **Profile Management**:
   - Doctors should be able to update clinic hours, consultation room, and specialty description so patients know who they are linking to.

---

## Recommended Team Work-Division Plan

### **Teammate A: Frontend Experience, UI Flow & Landing Page**
- [ ] Build `client/src/pages/LandingPage.jsx` and components in `client/src/components/landing/`.
- [ ] Update routing in `App.jsx` (`/` -> Landing, `/dashboard` -> Patient Dashboard).
- [ ] Implement the **Report Comparison View** (`TrendsPage` compare tab or standalone page).
- [ ] Build the **Biomarker Guide View** (`/guide`) with search and panel category filters.
- [ ] Add the frontend drag-and-drop PDF upload zone with extraction preview.
- [ ] Verify responsiveness across 360px (mobile), 768px (tablet), and 1280px (desktop).

### **Teammate B: Backend, MongoDB, Express APIs & PDF Parser Engine**
- [ ] Provide persistent MongoDB Atlas / local MongoDB URI in `server/.env` so data persists during teacher live evaluation.
- [ ] Implement PDF upload endpoint with `multer` and PDF text extraction parser (`pdf-parse` or Gemini API).
- [ ] Add Express endpoints for Report Comparison (`GET /api/reports/compare?id1=...&id2=...`).
- [ ] Add query filtering and search endpoints for Biomarker Guide (`GET /api/reports/references/all`).
- [ ] Showcase Express validation (`express-validator` on auth and report routes).
- [ ] Showcase MongoDB capabilities: Explain Mongoose schemas, compound unique indexes on links, and population (`populate('patient')`, `populate('doctor')`).
- [ ] Expand the test suite in `server/tests/unit.test.js` to demonstrate test coverage during academic defense.

---
*Created for LabLens Project Team Coordination & Grading Rubric Alignment.*
