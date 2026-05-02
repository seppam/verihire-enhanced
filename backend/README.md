# VeriHire Enhanced — Backend

> Part of the [VeriHire Enhanced monorepo](../README.md).  
> Original backend: [seppam/verihire-backend](https://github.com/seppam/verihire-backend)

## Features

- Job & CV analysis powered by Gemini + Elice GPT-5 (dual AI provider)
- Mayar Club payment integration with idempotent webhook processing
- MongoDB + Mongoose with sanitized queries
- Multi-language support (English + Indonesian)
- Rate limiting per user tier (guest vs logged-in)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth` | POST | Register, login, forgot/reset password |
| `/api/scan` | POST | Job scam detection (text, URL, file) |
| `/api/cv` | POST | CV analysis against target job |
| `/api/chat` | POST | AI chatbot (Career Buddy) |
| `/api/payment` | POST | Mayar Club checkout + webhook |
| `/api/stats` | GET | Public and user-level statistics |

## Environment Variables

See `.env.example` for all required variables.
