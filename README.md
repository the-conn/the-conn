# The Conn

A CI/CD Server Management Dashboard built with Next.js, Tailwind CSS, Monaco Editor, and shadcn UI components.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Configuration

Copy `.env.local.example` to `.env.local` and set the API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Features

- Pipeline YAML editor powered by Monaco Editor
- Create, save, and load named pipelines
- Trigger pipeline runs against a backend CI/CD server
- Toast notifications via Sonner
- Light/dark theme via CSS variables
