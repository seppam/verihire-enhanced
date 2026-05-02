# 📘 VeriHire Backend — API Documentation

> **Base URL:** `http://localhost:<PORT>/api`
>
> **Version:** 1.0
>
> **Last Updated:** 2026-04-08

---

## 📑 Table of Contents

| # | Category | Endpoints |
|---|----------|-----------|
| 1 | [🔐 Authentication & Profile](#-authentication--profile) | Register, Login, Get Me, Update Profile, Update Password, Forgot Password, Reset Password |
| 2 | [🧠 AI Integrations — Scan Job](#-ai-integrations--scan-job) | Detect Job (Text / URL / File) |
| 3 | [🧠 AI Integrations — CV Analysis](#-ai-integrations--cv-analysis) | Analyze CV |
| 4 | [🧠 AI Integrations — Chatbot](#-ai-integrations--chatbot) | Career Buddy Chat |
| 5 | [🗂️ History & Data — Scan Job](#️-history--data--scan-job) | Get Scan History, Get Scan Detail, Delete Scan |
| 6 | [🗂️ History & Data — CV Analysis](#️-history--data--cv-analysis) | Get CV History, Get CV Detail, Delete CV |
| 7 | [📊 Public Statistics](#-public-statistics) | Landing Page Stats |

---

## 🌐 Global Information

### Authentication Scheme

All protected routes use **Bearer Token** authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The token is obtained from the `/api/auth/login` or `/api/auth/register` response.

### Language Support (Dual-Language)

AI-related endpoints (`/api/scan`, `/api/cv`, `/api/chat`) support dual-language responses (English / Indonesian) via the `Accept-Language` header:

| Header Value | Language |
|---|---|
| `en` (default) | English |
| `id` | Indonesian (Bahasa Indonesia) |

### Rate Limiting

| Feature | Window | Logged-in User | Guest |
|---------|--------|----------------|-------|
| Scan Job | 24 hours | 50 requests | 3 requests |
| CV Analysis | 24 hours | 50 requests | N/A (login required) |
| Chatbot | 15 minutes | 100 requests | 30 requests |

> [!NOTE]
> When a rate limit is exceeded, the API returns `429 Too Many Requests` with a JSON body containing `success: false` and a descriptive `message`. For guest users on scan, the response also includes `triggerLogin: true`.

### Standard Error Response

All errors follow this consistent format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

## 🔐 Authentication & Profile

### 1. Register User

Creates a new user account and sends a welcome email.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/register` |
| **Auth** | ❌ Not required |
| **Content-Type** | `application/json` |

**Request Body:**

```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | `string` | ✅ | Will be trimmed |
| `email` | `string` | ✅ | Must be a valid email. Will be normalized |
| `password` | `string` | ✅ | Minimum 8 characters |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "data": {
    "user": {
      "_id": "663f1a2b...",
      "username": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "role": "user",
      "createdAt": "2026-04-08T10:00:00.000Z"
    }
  }
}
```

---

### 2. Login User

Authenticates a user and returns a JWT token.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/login` |
| **Auth** | ❌ Not required |
| **Content-Type** | `application/json` |

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | `string` | ✅ | Will be normalized before lookup |
| `password` | `string` | ✅ | — |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `Please provide email and password` |
| `401` | `Incorrect email or password` |

---

### 3. Get Current User (Me)

Returns the profile of the currently authenticated user.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/auth/me` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "663f1a2b...",
      "username": "John Doe",
      "email": "john@example.com",
      "avatar": "",
      "role": "user",
      "createdAt": "2026-04-08T10:00:00.000Z"
    }
  }
}
```

---

### 4. Update Profile

Updates the user's profile information (username, email, avatar). **Cannot** be used to update password.

| Property | Value |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/auth/profile` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | `application/json` |

**Request Body:** *(all fields optional)*

```json
{
  "username": "John Updated",
  "email": "john.new@example.com",
  "avatar": "https://example.com/avatar.png"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `username` | `string` | ❌ | New display name |
| `email` | `string` | ❌ | Will be normalized |
| `avatar` | `string` | ❌ | URL or base64 string for profile picture |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "663f1a2b...",
    "username": "John Updated",
    "email": "john.new@example.com",
    "avatar": "https://example.com/avatar.png",
    "role": "user",
    "createdAt": "2026-04-08T10:00:00.000Z"
  }
}
```

> [!WARNING]
> If the request body contains `password`, `currentPassword`, or `newPassword`, the API will return `400` with the message: *"This route is not for password updates. Please use /update-password."*

---

### 5. Update Password

Changes the authenticated user's password.

| Property | Value |
|---|---|
| **Method** | `PUT` |
| **URL** | `/api/auth/update-password` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | `application/json` |

**Request Body:**

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `currentPassword` | `string` | ✅ | Must match current password |
| `newPassword` | `string` | ✅ | Minimum 8 characters |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password updated successfully!"
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `Please provide both your current password and new password.` |
| `401` | `Your current password is incorrect!` |

---

### 6. Forgot Password

Sends a password reset link to the user's email. The reset token is valid for **10 minutes**.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/auth/forgot-password` |
| **Auth** | ❌ Not required |
| **Content-Type** | `application/json` |

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | `string` | ✅ | Must be a registered email |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset token has been sent to email."
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `404` | `Email not found.` |
| `500` | `Failed to send email.` |

---

### 7. Reset Password

Resets the user's password using a valid reset token from the email link.

| Property | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/auth/reset-password/:token` |
| **Auth** | ❌ Not required |
| **Content-Type** | `application/json` |

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `token` | `string` | The reset token received via email |

**Request Body:**

```json
{
  "password": "myNewPassword123"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `password` | `string` | ✅ | Minimum 8 characters |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Password successfully changed! Please login."
}
```

**Error Responses:**

| Status | Message |
|--------|---------|
| `400` | `Token is invalid or has expired.` |

---

## 🧠 AI Integrations — Scan Job

### 8. Detect Job Posting (Scam Detection)

Analyzes a job posting for potential scam indicators. Supports **three input modes**: raw text, URL, or file upload (PDF/DOCX/image).

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/scan/detect` |
| **Auth** | ⚡ Optional (`Authorization: Bearer <token>`) — works as guest with limited rate |
| **Content-Type** | `multipart/form-data` (when uploading file) **or** `application/json` (text/URL mode) |
| **Rate Limit** | Guest: 3/day · Logged-in: 50/day |

> [!IMPORTANT]
> This endpoint uses `optionalProtect` middleware. If a valid token is provided, the scan result is saved to the user's history. Without a token, the scan works as a guest (no history saved).

#### Mode A: Text Input

**Request Body** (`application/json`):

```json
{
  "content": "We are looking for a data entry specialist. Send $50 registration fee to...",
  "source": "whatsapp"
}
```

#### Mode B: URL Input

**Request Body** (`application/json`):

```json
{
  "url": "https://example.com/job-posting",
  "source": "linkedin"
}
```

#### Mode C: File Upload

**Request Body** (`multipart/form-data`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | `File` | ✅ | PDF, DOCX, JPG, PNG. Max **5MB** |
| `source` | `string` | ❌ | One of: `whatsapp`, `telegram`, `instagram`, `facebook`, `linkedin`, `other` |

#### Request Fields Summary

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `content` | `string` | Conditional | Required if no `url` or `file` provided |
| `url` | `string` | Conditional | Job posting URL to scrape |
| `file` | `File` | Conditional | Upload field name: `file` |
| `source` | `string` | ❌ | Platform source. Enum: `whatsapp`, `telegram`, `instagram`, `facebook`, `linkedin`, `other`. Default: `other` |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "664a1b3c...",
    "scanTitle": "suspicious_job.pdf",
    "inputType": "document_or_image",
    "url": null,
    "source": "whatsapp",
    "content": "Extracted or provided text content...",
    "analysis": {
      "score": 85,
      "verdict": "High Risk",
      "flags": [
        "Asks for upfront payment",
        "No company address provided",
        "Unrealistic salary promise"
      ],
      "recommendation": "This job posting shows multiple red flags commonly associated with scams. We strongly advise against proceeding."
    },
    "user": "663f1a2b...",
    "createdAt": "2026-04-08T10:30:00.000Z",
    "updatedAt": "2026-04-08T10:30:00.000Z"
  },
  "isGuest": false
}
```

> [!NOTE]
> The `isGuest` field in the response indicates whether the scan was performed by a guest (`true`) or a logged-in user (`false`). The `analysis.verdict` can be values like `"Safe"`, `"Suspicious"`, or `"High Risk"`.

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `400` | `No content provided.` | `Teks tidak boleh kosong.` |
| `400` | `File too large! Max 5MB.` | `File terlalu besar! Maks 5MB.` |
| `400` | `Unsupported format! Please use PDF, DOCX, JPG, or PNG.` | `Format tidak didukung! Gunakan PDF, DOCX, JPG, atau PNG.` |
| `429` | `You have reached the free scan limit. Please login for more scans!` | — |

---

## 🧠 AI Integrations — CV Analysis

### 9. Analyze CV

Uploads and analyzes a CV/resume file using AI. Returns a match score, strengths, weaknesses, improvement advice, rephrase suggestions, and job recommendations.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/cv/analyze` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | `multipart/form-data` |
| **Rate Limit** | 50 requests / 24 hours |

**Request Body** (`multipart/form-data`):

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `cv` | `File` | ✅ | Upload field name: **`cv`**. Accepts PDF, DOCX, JPG, PNG. Max **5MB** |
| `jobTarget` | `string` | ❌ | Target job position (e.g., `"Frontend Developer"`). Default: `"General"` |

**Success Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "664b2c4d...",
    "user": "663f1a2b...",
    "jobTarget": "Frontend Developer",
    "cvFileName": "john_doe_resume.pdf",
    "improvedCvText": "JOHN DOE\nFrontend Developer | React.js Specialist\n...",
    "analysis": {
      "cvMatchScore": 72,
      "matchStatus": "Medium",
      "strengths": [
        "Strong experience with React.js and modern JavaScript",
        "Multiple relevant project examples"
      ],
      "weaknesses": [
        "No mention of testing frameworks",
        "Limited description of team collaboration"
      ],
      "improvementAdvice": [
        "Add experience with unit testing (Jest, React Testing Library)",
        "Include metrics and quantifiable achievements"
      ],
      "rephraseSuggestions": [
        {
          "original": "Worked on frontend stuff",
          "improved": "Developed and maintained responsive UI components using React.js, serving 10K+ daily users",
          "reason": "More specific and includes quantifiable impact"
        }
      ],
      "jobRecommendations": [
        "React Developer",
        "UI Engineer",
        "Full-Stack JavaScript Developer"
      ]
    },
    "createdAt": "2026-04-08T11:00:00.000Z",
    "updatedAt": "2026-04-08T11:00:00.000Z"
  }
}
```

> [!NOTE]
> The `cvText` (raw extracted text) is saved to the database but is **hidden by default** (`select: false`) in responses to keep payloads lightweight. It is only included when fetching a single CV history detail (`GET /api/cv/history/:id`).

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `400` | `Please upload a CV file (PDF).` | `Harap unggah file CV (PDF).` |
| `400` | `CV content is too short or unreadable.` | `Konten CV terlalu pendek atau tidak terbaca.` |
| `400` | `Unsupported format! Please use PDF, DOCX, JPG, or PNG.` | `Format tidak didukung! Gunakan PDF, DOCX, JPG, atau PNG.` |
| `429` | `You have reached the daily CV analysis limit (50 scans). Please try again tomorrow.` | — |

---

## 🧠 AI Integrations — Chatbot

### 10. Career Buddy Chat

Sends a message to the AI-powered "Career Buddy" chatbot. The bot specializes in recruitment security, job scam detection tips, and career advice.

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/chat` |
| **Auth** | ⚡ Optional (`Authorization: Bearer <token>`) — works as guest with reduced rate limit |
| **Content-Type** | `application/json` |
| **Rate Limit** | Guest: 30/15min · Logged-in: 100/15min |

**Request Body:**

```json
{
  "message": "How can I identify a fake job offer on LinkedIn?"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `message` | `string` | ✅ | The user's question or message |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "reply": "Great question! Here are some key signs of a fake job offer on LinkedIn:\n\n• **Too good to be true salary**: If the pay seems unrealistically high for the role...\n• **Vague job description**: Legitimate employers provide clear responsibilities...\n• **Requests for personal information upfront**: Never share your SSN or bank details...\n\nAlways verify the company on their official website before applying!"
}
```

> [!IMPORTANT]
> The chatbot is **stateless** — each message is treated as an independent question. There is no conversation history maintained on the server side. The frontend should manage conversation context in the UI if needed.

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `400` | `Message cannot be empty.` | `Pesan tidak boleh kosong.` |
| `500` | `Failed to get AI response.` | `Gagal mendapatkan respon dari AI.` |
| `429` | `Too many requests. Please wait a few minutes before trying again.` | — |

---

## 🗂️ History & Data — Scan Job

> [!IMPORTANT]
> All scan history endpoints require authentication (`protect` middleware). Only the owner of the scan record can access or delete it.

### 11. Get Scan History (Paginated)

Retrieves the authenticated user's job scan history with pagination.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/scan/my-history` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page |

**Example:** `GET /api/scan/my-history?page=2&limit=5`

**Success Response:** `200 OK`

```json
{
  "success": true,
  "count": 5,
  "pagination": {
    "totalItems": 23,
    "totalPages": 5,
    "currentPage": 2,
    "itemsPerPage": 5
  },
  "data": [
    {
      "_id": "664a1b3c...",
      "scanTitle": "suspicious_job.pdf",
      "inputType": "document_or_image",
      "source": "whatsapp",
      "content": "...",
      "analysis": {
        "score": 85,
        "verdict": "High Risk",
        "flags": ["..."],
        "recommendation": "..."
      },
      "createdAt": "2026-04-08T10:30:00.000Z",
      "updatedAt": "2026-04-08T10:30:00.000Z"
    }
  ]
}
```

---

### 12. Get Scan History Detail

Retrieves a single scan result by its ID.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/scan/my-history/:id` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | MongoDB ObjectId of the scan record |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "664a1b3c...",
    "scanTitle": "suspicious_job.pdf",
    "inputType": "document_or_image",
    "url": null,
    "source": "whatsapp",
    "content": "Full extracted text content...",
    "analysis": {
      "score": 85,
      "verdict": "High Risk",
      "flags": [
        "Asks for upfront payment",
        "No company address provided"
      ],
      "recommendation": "This job posting shows multiple red flags..."
    },
    "user": "663f1a2b...",
    "createdAt": "2026-04-08T10:30:00.000Z",
    "updatedAt": "2026-04-08T10:30:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `404` | `Scan history not found or unauthorized access.` | `Riwayat scan tidak ditemukan atau akses ditolak.` |

---

### 13. Delete Scan History

Deletes a specific scan record owned by the authenticated user.

| Property | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/scan/my-history/:id` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | MongoDB ObjectId of the scan record to delete |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Scan history successfully deleted."
}
```

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `404` | `Scan history not found or unauthorized access.` | `Riwayat scan tidak ditemukan atau akses ditolak.` |

---

## 🗂️ History & Data — CV Analysis

> [!IMPORTANT]
> All CV history endpoints require authentication (`protect` middleware). Only the owner of the CV record can access or delete it.

### 14. Get CV History (Paginated)

Retrieves the authenticated user's CV analysis history with pagination.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/cv/history` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `10` | Items per page |

**Example:** `GET /api/cv/history?page=1&limit=10`

**Success Response:** `200 OK`

```json
{
  "success": true,
  "count": 3,
  "pagination": {
    "totalItems": 3,
    "totalPages": 1,
    "currentPage": 1,
    "itemsPerPage": 10
  },
  "data": [
    {
      "_id": "664b2c4d...",
      "user": "663f1a2b...",
      "jobTarget": "Frontend Developer",
      "cvFileName": "john_doe_resume.pdf",
      "improvedCvText": "JOHN DOE\nFrontend Developer...",
      "analysis": {
        "cvMatchScore": 72,
        "matchStatus": "Medium",
        "strengths": ["..."],
        "weaknesses": ["..."],
        "improvementAdvice": ["..."],
        "rephraseSuggestions": [{ "original": "...", "improved": "...", "reason": "..." }],
        "jobRecommendations": ["..."]
      },
      "createdAt": "2026-04-08T11:00:00.000Z",
      "updatedAt": "2026-04-08T11:00:00.000Z"
    }
  ]
}
```

---

### 15. Get CV History Detail

Retrieves a single CV analysis result by its ID. **Includes the raw `cvText`** field which is normally hidden.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/cv/history/:id` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | MongoDB ObjectId of the CV analysis record |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "664b2c4d...",
    "user": "663f1a2b...",
    "jobTarget": "Frontend Developer",
    "cvFileName": "john_doe_resume.pdf",
    "cvText": "John Doe\nEmail: john@example.com\nExperience: ...",
    "improvedCvText": "JOHN DOE\nFrontend Developer | React.js Specialist\n...",
    "analysis": {
      "cvMatchScore": 72,
      "matchStatus": "Medium",
      "strengths": ["Strong React.js experience", "..."],
      "weaknesses": ["No testing frameworks mentioned", "..."],
      "improvementAdvice": ["Add unit testing experience", "..."],
      "rephraseSuggestions": [
        {
          "original": "Worked on frontend stuff",
          "improved": "Developed responsive UI components using React.js",
          "reason": "More specific and professional"
        }
      ],
      "jobRecommendations": ["React Developer", "UI Engineer"]
    },
    "createdAt": "2026-04-08T11:00:00.000Z",
    "updatedAt": "2026-04-08T11:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `404` | `CV history not found or unauthorized access.` | `Riwayat CV tidak ditemukan atau akses ditolak.` |

---

### 16. Delete CV History

Deletes a specific CV analysis record owned by the authenticated user.

| Property | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/cv/history/:id` |
| **Auth** | ✅ `Authorization: Bearer <token>` |
| **Content-Type** | — (no body) |

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | MongoDB ObjectId of the CV analysis record to delete |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "CV history successfully deleted."
}
```

**Error Responses:**

| Status | Message (EN) | Message (ID) |
|--------|-------------|--------------|
| `404` | `CV history not found or unauthorized access.` | `Riwayat CV tidak ditemukan atau akses ditolak.` |

---

## 📊 Public Statistics

### 17. Get Landing Page Statistics

Returns aggregated statistics for the public landing page. No authentication required.

| Property | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/stats/public` |
| **Auth** | ❌ Not required |
| **Content-Type** | — (no body) |

**Success Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "totalScans": 1542,
    "totalFake": 387,
    "topSource": "whatsapp"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `totalScans` | `number` | Total number of job scans performed across all users |
| `totalFake` | `number` | Total scans with verdict `"Suspicious"` or `"High Risk"` |
| `topSource` | `string` | The most frequently reported source platform. `"N/A"` if no data |

---

## 📎 Appendix

### A. Complete Endpoint Map

| # | Method | URL | Auth | Description |
|---|--------|-----|------|-------------|
| 1 | `POST` | `/api/auth/register` | ❌ | Register new user |
| 2 | `POST` | `/api/auth/login` | ❌ | Login user |
| 3 | `GET` | `/api/auth/me` | ✅ | Get current user profile |
| 4 | `PUT` | `/api/auth/profile` | ✅ | Update profile |
| 5 | `PUT` | `/api/auth/update-password` | ✅ | Change password |
| 6 | `POST` | `/api/auth/forgot-password` | ❌ | Request password reset email |
| 7 | `PATCH` | `/api/auth/reset-password/:token` | ❌ | Reset password with token |
| 8 | `POST` | `/api/scan/detect` | ⚡ | Detect scam job posting |
| 9 | `POST` | `/api/cv/analyze` | ✅ | Analyze CV with AI |
| 10 | `POST` | `/api/chat` | ⚡ | Chat with Career Buddy |
| 11 | `GET` | `/api/scan/my-history` | ✅ | List scan history |
| 12 | `GET` | `/api/scan/my-history/:id` | ✅ | Get scan detail |
| 13 | `DELETE` | `/api/scan/my-history/:id` | ✅ | Delete scan record |
| 14 | `GET` | `/api/cv/history` | ✅ | List CV history |
| 15 | `GET` | `/api/cv/history/:id` | ✅ | Get CV detail |
| 16 | `DELETE` | `/api/cv/history/:id` | ✅ | Delete CV record |
| 17 | `GET` | `/api/stats/public` | ❌ | Get landing page stats |

> **Auth Legend:** ✅ Required · ❌ Not required · ⚡ Optional (enhanced features when logged in)

### B. Supported File Types for Upload

| MIME Type | Extension | Used In |
|-----------|-----------|---------|
| `application/pdf` | `.pdf` | Scan Job, CV Analysis |
| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` | Scan Job, CV Analysis |
| `image/jpeg` | `.jpg`, `.jpeg` | Scan Job, CV Analysis |
| `image/png` | `.png` | Scan Job, CV Analysis |

### C. Source Platform Enum

Used in the `source` field of Scan Job:

```
whatsapp | telegram | instagram | facebook | linkedin | other
```

### D. Analysis Verdict Values (Scan Job)

| Verdict | Description |
|---------|-------------|
| `Safe` | Job posting appears legitimate |
| `Suspicious` | Some red flags detected |
| `High Risk` | Multiple scam indicators found |

### E. Match Status Values (CV Analysis)

| Status | Score Range |
|--------|------------|
| `Low` | 0–39 |
| `Medium` | 40–69 |
| `High` | 70–89 |
| `Excellent` | 90–100 |
