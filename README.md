# VeriHire Enhanced

> **This is an enhanced, merged version of the original VeriHire project.**  
> Original repositories:
> - Backend: [seppam/verihire-backend](https://github.com/seppam/verihire-backend)
> - Frontend: [timurboys112/verihire-capstone](https://github.com/timurboys112/verihire-capstone)

---

## What is VeriHire?

VeriHire is a comprehensive full-stack application designed to combat job scams and optimize CVs using state-of-the-art AI. By leveraging Gemini and GPT-5 models, VeriHire provides real-time fraud detection for job postings and metric-driven optimization for resumes.

## Features

- **Job Scam Detection**: Analyze job descriptions from URLs, text, or images (OCR) to detect fraudulent patterns.
- **CV Optimization**: Match resumes against target job descriptions with scoring and rephrasing suggestions.
- **Auth Persistence**: State-of-the-art session management with real-time token validation.
- **AI-Powered Insights**: Dual-provider AI (Google Gemini & Elice GPT-5) for high-accuracy analysis.
- **Premium Membership**: Cumulative token-based system with automated payment processing via Mayar Club.
- **Multi-Language Support**: Fully localized experience in English and Indonesian.

## Tech Stack

- **Frontend**: React, Axios, React Icons, Cloudflare Turnstile.
- **Backend**: Node.js, Express, MongoDB, Nodemailer, Axios.
- **AI**: Google Gemini AI, Elice GPT-5, Tesseract.js (OCR), PDF-Parse.
- **Payments**: Mayar Club Gateway Integration.

## Project Structure

```
VeriHireEnhanced/
├── backend/          # Node.js/Express API with MongoDB/Mongoose
├── frontend/         # React.js SPA with modern, responsive UI
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas or local instance
- API Keys for Gemini (Google), Elice (GPT-5), and Mayar Club

### Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your API keys in .env
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in REACT_APP_API_URL and REACT_APP_TURNSTILE_SITE_KEY
npm install
npm start
```

---

## Security & Stability

- **Atomic Quota Decrement**: Scan token deduction uses MongoDB `findOneAndUpdate` with `$inc` to prevent race conditions.
- **NoSQL Injection Protection**: Custom middleware blocks MongoDB operator keys (`$where`, `$ne`, `$gt`, etc.) from `req.body`, `req.query`, and `req.params`.
- **Webhook Signature Verification**: Mayar payment webhooks are verified using HMAC-SHA256 with a shared secret.
- **AI Response Validation**: All AI JSON responses are validated before being returned to the client.
- **Request Timeouts**: All external AI/axios calls have a 30-second timeout to prevent hanging connections.
- **Idempotent Payments**: Duplicate Mayar webhook calls are safely ignored using a transaction ID allowlist.
- **Auth Persistence**: Root-level `getMe()` re-authentication ensures seamless SPA experience.
- **Cloudflare Turnstile**: Integrated bot protection for guest users.
- **Rate Limiting**: Separate limits for guests (3 scans/day) vs logged-in users (50 scans/day).
- **Chat History Safety**: Messages are saved to the database only after receiving an AI reply (no orphan messages).

## License

MIT License.
