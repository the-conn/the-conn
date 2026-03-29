# AGENTS.md: Frontend Standards for The Conn

This document defines the architectural patterns and coding standards for **The Conn** frontend. All AI agents and contributors must adhere to these rules to ensure system integrity and aesthetic consistency.

## 1. Core Tech Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript (Strict Mode)
* **State & Fetching:** TanStack Query (React Query)
* **Styling:** Tailwind CSS + Linaria (Zero-runtime CSS-in-JS)
* **Icons:** Lucide React

---

## 2. Coding Principles
* **Clean Code:** No inline comments. No emojis. Code must be self-documenting through clear naming conventions.
* **Strict Typing:** Use of `any` is strictly prohibited. Define precise interfaces for all API responses based on the PostgreSQL schema.
* **Component Architecture:**
  * Favor **Server Components** for static layout elements.
  * Use **Client Components** only when interactivity (hooks, event listeners) is required.
  * Maintain a `components/ui` directory for atomic, reusable elements (Buttons, Cards, Badges).

---

## 3. Aesthetic & UI Standards
* **The Identity:** Professional, high-density, retro-futuristic naval console.
* **Typography:**
  * **Prose:** Sans-serif for UI labels and navigation.
  * **Data:** Monospace for UUIDs, SHAs, timestamps, and logs.

---

## 4. Data Fetching & State
* **Polling:** Use TanStack Query for background synchronization.
  * The **Sidebar** should poll frequently (e.g., 30s).
  * The **Pipeline Detail** should poll more aggressively (e.g., 10s) if the run status is `ENGAGED`.
* **URL as Source of Truth:** The `run_id` must always be managed via the URL route (`/runs/[run_id]`). Do not store the "active run" in global state (Zustand/Redux) if it can be derived from the path.
* **Isolation:** The "Sync" action must trigger an invalidation of the `runs` query key without affecting the `run-detail` query key.

---

## 5. Performance Standards
* **Log Handling:** Never include `output_log` in the main node list payload. Fetch logs only via the dedicated `/logs` endpoint.
* **Memoization:** Use `useMemo` for heavy data transformations, such as calculating Gantt chart offsets or filtering large log arrays.
* **Virtualization:** Any list potentially exceeding 100 items (like logs or long history) must use a virtualization library (e.g., `react-virtuoso`).

---

## 6. Project Structure
```text
src/
├── app/              # Next.js App Router (Pages & Layouts)
├── components/       # UI and Layout components
├── hooks/            # Custom React hooks (e.g., usePipelineData)
├── services/         # API client and TanStack Query definitions
├── types/            # Global TypeScript interfaces
└── utils/            # Time calculations and data formatters
```
