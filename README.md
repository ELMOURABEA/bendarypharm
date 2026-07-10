# 🏥 صيدليات البنداري | El-Bendary Pharmacy

منصة تجارة إلكترونية لصيدليات البنداري، خدمة رعاية صحية متكاملة في مصر منذ عام 1980.

## Overview

A single-page storefront for El-Bendary Pharmacy built with React, Vite, and TypeScript, deployed on Netlify. Customers can browse products, get AI-assisted pharmacist guidance, manage prescriptions, and check out with a manual wallet/InstaPay confirmation flow backed by WhatsApp order notifications.

## Features

- **Storefront** — product browsing, categories, brand filters, comparison, and detail modals
- **AI Pharmacist Chat** — Gemini-powered assistant that answers health questions and recommends in-stock products (`server.ts` / `api/chat.ts`)
- **Cart & Checkout** — cart drawer, order progress tracking, and a payment modal for wallet/InstaPay-style transfers
- **Prescription Upload** — customers can upload prescriptions for medications that require one
- **Dosage Calculator** and **Medication Reminders**
- **Branch Locator** — map view (Leaflet) of pharmacy branches
- **Accounts & Orders** — auth view, account management, order tracking history
- **Installable PWA** — offline-ready via `vite-plugin-pwa`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS |
| Auth/Data | Supabase (falls back to a local-storage emulation when no Supabase project is configured, for demo/sandbox use) |
| AI | Google Gemini via `@google/genai` |
| Maps | Leaflet / react-leaflet |
| Payments | Stripe SDK + manual wallet/InstaPay confirmation flow |
| Server | Express (`server.ts`) for local dev, Netlify Functions (`api/chat.ts`) in production |
| Hosting | Netlify |

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   Supabase variables are optional — without them the app runs against a local-storage mock so auth and cart flows still work.
3. Run the app:
   ```bash
   npm run dev
   ```

## Build & Deploy

The site builds with `npm run build` and deploys to Netlify (see `netlify.toml`); the AI chat endpoint is served from `api/chat.ts` as a Netlify Function in production.

## Contact

- **Orders (WhatsApp):** 01200400094
- **Payments (WhatsApp):** 01200400098
