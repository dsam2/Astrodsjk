| \# | Document | One-line purpose |
| :---: | :---- | :---- |
| **01** | **PRD — Product Requirements Doc** | What you're building and for whom |
| **02** | **TRD — Technical Requirements Doc** | Which tech, tools, and APIs you'll use |
| **03** | **App Flow** | Every page, every click, every navigation path |
| **04** | **UI/UX Design Brief** | How your app looks and feels |
| **05** | **Backend Schema** | Data structure, tables, auth, relationships |
| **06** | **Implementation Plan** | The exact step-by-step build sequence |

| Document 01 — PRD Template |  |
| :---- | :---- |
| **App Name** | e.g. TaskFlow |
| **Tagline** | One sentence. What does it do? |
| **Problem** | What pain does this solve? Who feels it? |
| **Target User** | Describe your primary user in 2–3 sentences |
| **Core Features (Must Have)** | List each feature on a new line |
| **Nice to Have** | Features for v2 / if time allows |
| **Out of Scope** | What this version explicitly won't do |
| **User Stories** | As a \[user\], I want to \[action\] so that \[outcome\] |
| **Success Metrics** | e.g. 100 signups in first week, task completion rate \> 80% |

**02**  
**TRD**  — Technical Requirements Document

*The blueprint your AI agent needs to make technical decisions without guessing.*

**Why it matters**

The TRD translates your product vision into technical decisions. It answers: what language, what framework, what database, what third-party services.

When you skip this, your AI picks a stack on its own — sometimes well, often inconsistently. The TRD locks in the choices so the agent stays coherent across every file it writes.

**What to include**

* Frontend framework (e.g. React, Next.js, Vue)

* Backend framework or runtime (e.g. Node/Express, Python/FastAPI)

* Database type and provider (e.g. PostgreSQL on Supabase)

* Authentication method (e.g. Supabase Auth, Clerk, NextAuth)

* Hosting and deployment (e.g. Vercel, Railway, Fly.io)

* Third-party APIs and services (e.g. Stripe, Resend, OpenAI)

* Folder structure and naming conventions

* Environment variables needed

* Any hard technical constraints or preferences

**Template**

| Document 02 — TRD Template |  |
| :---- | :---- |
| **Frontend** | e.g. Next.js 14 with TypeScript, Tailwind CSS |
| **Backend** | e.g. Next.js API routes / Supabase Edge Functions |
| **Database** | e.g. PostgreSQL via Supabase |
| **Auth** | e.g. Supabase Auth — email \+ Google OAuth |
| **Hosting** | e.g. Vercel (frontend), Supabase (backend \+ DB) |
| **Third-party APIs** | List each: name, purpose, free/paid tier |
| **Key Libraries** | e.g. React Query, Zod, Lucide Icons |
| **Environment Variables** | List each variable name (not value) |
| **Constraints** | e.g. Must work on mobile, must be free tier only |

**03**  
**App Flow**  — Navigation & User Journey Map

*Every page, every click, every path — mapped before a single screen is built.*

**Why it matters**

The app flow tells your AI exactly how users move through your product. What happens when they click a button. Where they go after signup. What the logged-out vs logged-in experience looks like.

Without this, the AI builds pages in isolation. They work individually but don't connect. The app flow is what makes your product feel like one coherent thing.

**What to include**

* List of all screens / pages with short descriptions

* Navigation structure (sidebar, tabs, back buttons, etc.)

* Entry points — where does the user land first?

* Auth flow — signup → onboarding → dashboard sequence

* Key user journeys (the most important 2–3 flows)

* Edge cases — empty states, error states, loading states

* Modal / drawer / overlay interactions

* Redirect logic — where does each action take the user?

**Template**

| Document 03 — App Flow Template |  |
| :---- | :---- |
| **Pages List** | List every page: / (home), /login, /dashboard, /settings, etc. |
| **Navigation Type** | e.g. Top navbar, left sidebar, bottom tabs (mobile) |
| **First Screen** | What does a brand new visitor see? |
| **Auth Flow** | Signup → Email verify → Onboarding → Dashboard |
| **Core User Journey 1** | Step-by-step: User wants to \[goal\]. They go to... then... |
| **Core User Journey 2** | Another key flow |
| **Empty States** | What shows when there's no data yet? |
| **Error States** | e.g. Failed payment, network error — where do users go? |
| **Redirects** | e.g. After login → /dashboard, after logout → / |

**04**  
**UI/UX Design Brief**  — Visual & Interaction Design Guide

*So the AI doesn't just build something functional — it builds something you'd actually use.*

**Why it matters**

AI agents default to plain, unstyled, or inconsistent UIs when left to their own judgment. The design brief locks in your visual language: colors, fonts, component style, spacing, and overall vibe.

You don't need to be a designer. Even a rough direction ('dark mode, minimal, like Linear') gives the AI enough to make coherent decisions across every screen.

**What to include**

* Overall aesthetic direction (e.g. minimal, bold, playful, corporate)

* Color palette — primary, secondary, background, text, accent

* Typography — font choices, heading sizes, body size

* Component style — rounded vs sharp corners, flat vs shadowed

* Dark mode / light mode preference

* Inspiration references (apps you like the look of)

* Key UI patterns (cards, tables, modals, sidebars)

* Mobile responsiveness requirements

* Accessibility considerations (contrast, font size, etc.)

**Template**

| Document 04 — UI/UX Design Brief Template |  |
| :---- | :---- |
| **Aesthetic** | e.g. Minimal, clean, dark-mode first. Like Linear or Vercel. |
| **Primary Color** | e.g. \#6C47FF (indigo) |
| **Background Color** | e.g. \#0D0D0D (dark) or \#FFFFFF (light) |
| **Text Color** | e.g. \#F5F5F7 |
| **Accent / CTA Color** | e.g. \#6C47FF |
| **Font** | e.g. Inter for UI, Geist Mono for code |
| **Border Radius** | e.g. 8px rounded corners throughout |
| **Shadows** | e.g. Subtle card shadows, no heavy drop shadows |
| **Dark/Light Mode** | e.g. Dark mode primary, light mode optional |
| **Reference Apps** | e.g. Linear, Vercel, Notion, Raycast |
| **Mobile** | e.g. Fully responsive, bottom tab nav on mobile |

**05**  
**Backend Schema**  — Data Model & Auth Architecture

*How your data is stored, structured, and secured — defined before the AI writes a single migration.*

**Why it matters**

The backend schema is the hardest document to change after the fact. Once your database has data in it, restructuring tables is painful. Getting this right upfront saves hours of debugging and migration hell.

Your AI agent uses this to write database migrations, API routes, and auth logic. The more precise you are, the less it has to guess — and the fewer security holes end up in your codebase.

**What to include**

* List of all database tables with columns and data types

* Primary keys and foreign key relationships

* Indexes (which columns need fast lookup?)

* Auth model — who can access what? (Row Level Security rules)

* User roles and permissions (admin, user, guest, etc.)

* Any sensitive fields that need encryption

* File/media storage structure (if applicable)

* Webhooks or event triggers

* API endpoint list (optional but helpful)

**Template**

| Document 05 — Backend Schema Template |  |
| :---- | :---- |
| **Table: users** | id (uuid), email (text), name (text), created\_at (timestamp), role (text) |
| **Table: \[your table\]** | id, \[columns\], user\_id (FK → users.id), created\_at |
| **Table: \[your table\]** | Add more tables as needed |
| **Relationships** | e.g. projects.user\_id → users.id (many-to-one) |
| **Auth Provider** | e.g. Supabase Auth — JWT tokens, email/OAuth |
| **Row Level Security** | e.g. Users can only read/write their own rows |
| **User Roles** | e.g. admin: full access, user: own data only |
| **File Storage** | e.g. Supabase Storage — /avatars/{user\_id}, /uploads/{user\_id} |
| **Sensitive Fields** | e.g. payment\_method — stored via Stripe, not in DB |

**06**  
**Implementation Plan**  — Step-by-Step Build Sequence


## requirements
2. API & Technical Architecture Analysis
Important Note on APIs: This application is designed as an Offline-First app. It does not rely on a central web server (REST API) to perform astrological calculations. Instead, it contains a built-in mathematical engine (Ephemeris) to calculate planetary positions locally on your device.

However, it interacts with specific system and external APIs to function:

A. External Web APIs (Third-Party Services)
Since the app is offline, external API calls are minimal, but based on developer responses and features, it likely uses:

Google Maps / Places API:

Purpose: The developer mentioned in a review response: "This will fetch accurate coordinates from Google."

Usage: Used when you use the "Add Place" feature to find the latitude/longitude of a city not in its internal database.

Google Play Billing API:

Purpose: To handle the In-App Purchases (Subscription) for the "Unlimited Complete Horoscope PDF" feature.

3. App Permissions (Inferred from Features)
To perform the tasks above, the app requires the following permissions on your device:



4. Detailed Feature List
The app is feature-rich for an offline tool. Here is a breakdown of every major module:

Calculations & Charts:

Styles: South-Indian, North-Indian, East-Indian.

Shodasha Varga (20 Charts): Rashi, Navamsha, Hora, Drekkana, Saptamsha, Dashamsha, etc., up to Shashtyamsha (D60).

KP System (Krishnamurti Paddhati): KP Chart, Cusp details, Sub Lord, Sub-Sub Lord, Planet/House Significators, 4-Step Signification.

Jaimini System: Chara Dasha, Karakamsha.

Varshaphala: Tajaka charts (Annual Horoscope).

Planetary Details:

Ephemeris: Daily positions of planets.

Avasthas: Planetary states, Retrograde status, Combustion.

Special Points: Mrityu Bhaga, Pushkaramsa, Bhrigu Bindu, Yogi, Ava Yogi, Beeja/Kshetra Sphuta.

Dasha Systems (Timing):

Vimshottari (up to Prana-antara), Ashtottari, Yogini, Tribhagi.

Panchang & Muhurta:

Daily Panchang: Tithi, Nakshatra, Yoga, Karana, Sunrise/Sunset.

Muhurta Tools: Hora, Choghadiya, Tamil Gowri Panchangam (Nalla Neram), Rahu Kalam, Yamaganda.

Predictions & Analysis (Calculated):

Yogas: Identification of standard yogas (Dhana, Raja, etc.) with graphical strength indicators.

Ashtakavarga: Sarvashtakavarga tables and scores.

Matching: Horoscope matching (Gun Milan) based on Ashta Kuta (36 points) and Dashkoota.

Miscellaneous:

PDF Export: Save complete reports (subscription required for unlimited full reports).

Widget: Home screen widget for current planetary transit (Gochar).

City Database: 10,000+ Indian cities + major global cities built-in.