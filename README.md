# Translation System Frontend

A robust, modern React-based web portal for the Translation System. This frontend orchestrates an end-to-end multi-format translation pipeline (Books, Exams, Answer Keys), serving both Administrative power users and Students dynamically.

![System Overview](https://img.shields.io/badge/Vite-v8-blue.svg?logo=vite)
![React](https://img.shields.io/badge/React-v19-61dafb.svg?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4.svg?logo=tailwindcss)
![Zustand](https://img.shields.io/badge/State_Management-Zustand-orange.svg)

---

## Design Philosophy
The system incorporates an aggressively modern, premium aesthetic emphasizing deep user legibility. It utilizes curated modern gradients, rounded visual boundaries, context-aware iconography via `lucide-react`, dynamic grid layouts, and instantaneous feedback using `react-hot-toast`. 

## Key Features

### Admin Portal
The Administrative interface serves as the command center for data ingestion, user governance, and overarching system configuration.
- **Intelligent Dashboard (`/admin/dashboard`)**: Features real-time KPI overviews (Total Translations, active jobs, success rates) and beautifully themed, context-aware "Quick Action" gateways into submodules.
- **Institutional Alignment (`/admin/institutions`)**: Direct CRUD management for schools and educational bodies. Links students and exams to verified physical locations or administrative zones.
- **User Governance (`/admin/users`)**: Rapidly provision, manage, and govern student accounts, assign strict institution dependencies, and enforce granular platform access levels.
- **Global Typography & Localization (`/admin/languages`)**: Enable, configure, and curate target output languages for the translation engine.
- **Library Content Pipelines (`/admin/books` & `/admin/exams`)**: Complex asynchronous UI to inject multi-page PDFs, structured Exams, and massive Books into the extraction engines. Administrators can directly execute ad-hoc translation jobs identically to students. 
- **Answer Key Integrity (`/admin/answer-keys`)**: A secured subspace to store grading criteria logic decoupled seamlessly from the student-facing exams until execution demands it.
- **Deep Translation Analytics (`/admin/translation-stats`)**: Sophisticated breakdown of translation metrics populated by dynamic `recharts` engines. Provides Status distribution bars, Donut charts for Content Types, and active Bar charts for localized Language popularity. Incorporates a unified recent-history tracker monitoring all system translation polling requests.
- **Asynchronous Translation Engine UI**: A highly refined feature running on both Admin Content and Student detail pages. It allows admins to seamlessly trigger translations with built-in polling loops, resilient state checking (`pending` -> `processing` -> `completed`), and secure, memory-managed binary blob sandboxing/downloading.

### Student Portal
The Student layer trims away configuration settings, presenting an immersive, distraction-free environment solely dedicated to academic progression.
- **Contextual Book Browsing (`/student/books`)**: A beautifully formatted gallery library where students can organically scan through their approved curriculum textbooks. Features rich thumbnailing and structured categorizations.
- **Detailed Book Examination (`/student/books/:id`)**: An isolated reading container offering a focused deep dive into specific literature metadata.
- **Structured Exam Portal (`/student/exams` & `/student/exams/:id`)**: Browse examination documents specifically mapped to the student's grade level and institutional constraints.
- **Self-Serve Autonomous Translation**: When viewing an Exam or Book, students have native one-click access to dynamic translation engines. The system instantly pings the Python backend, handles loading states natively through `react-hot-toast` loading promises, and directly pipes the localized multi-language asset back to the student's browser window seamlessly.

## Technology Stack
- **Framework Core**: React 19 bootstrapped with Vite 8 for lightning-fast HMR and build pipelines.
- **Styling**: Tailwind CSS v4.2.2 natively integrated using postcss.
- **State Management**: `zustand` for lightweight, scalable global auth and UI state.
- **Routing**: `react-router-dom` v7 handling protected layout layers.
- **Charting Engine**: `recharts` powering all administrative analytical data presentation.
- **Network Layer**: Specialized `axios` structures grouping endpoints clearly under domain boundaries (`adminAPI`, `studentAPI`). Everything operates entirely behind strict Auth-Token lifecycle management.

## ⚙️ Local Development Setup

Ensure you have a recent version of [Node.js](https://nodejs.org/) installed.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Set up your `.env` to point to the Translation System's Python/Django API backend interface!
   ```env
   VITE_API_BASE_URL=http://your-backend-api-endpoint.com/api
   ```

3. **Spin up the Development Server**
   ```bash
   npm run dev
   ```
   > The application will automatically hot-reload across local endpoints (`localhost:5173`).

## 📁 Repository Structure
\`\`\` text
src/
├── api/                  # Unified Axios boundaries and endpoint configurations
├── components/           # Reusable UI architecture (Tables, Modals, Auth Forms)
│   ├── admin/            # Admin-specific modules (Dashboard cards, Admin Layouts)
│   ├── student/          # Student-facing content renderers
│   └── shared/           # Cross-cutting UI assets (Buttons, Generic Loaders, Confirm Modals)
├── pages/                # High-level route aggregators
│   ├── admin/            # Dashboard.jsx, TranslationStats.jsx, Books.jsx, etc.
│   ├── student/          # Student portals, details, etc.
│   └── auth/             # Login/Register state pages
├── store/                # Zustand global context providers (auth_store.jsx)
└── index.css             # Tailwind baseline injection
\`\`\`

---


