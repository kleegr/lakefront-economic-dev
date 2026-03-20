# Lakefront Economic Development Platform

Public website + internal operations portal for Lakefront Estates, Okeechobee FL.

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind CSS + GoHighLevel API

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Access
- Public: http://localhost:3000
- Portal: http://localhost:3000/portal/dashboard
- Login: http://localhost:3000/portal/login

## GHL Config Required
Set GHL_API_KEY and GHL_LOCATION_ID in env vars. See .env.example for all config options.
