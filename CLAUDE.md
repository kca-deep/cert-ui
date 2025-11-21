# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KCA 국가기술자격검정 AI Chatbot - A Next.js chat interface that connects to a Dify AI backend for answering questions about Korean national technical qualification exams.

## Commands

```bash
npm run dev     # Start development server (http://localhost:3000)
npm run build   # Production build
npm run lint    # Run ESLint
```

## Architecture

- **Next.js 16 App Router** with React 19
- **UI**: shadcn/ui components (Radix UI + Tailwind CSS v4)
- **Backend Integration**: Dify AI API via streaming SSE

### Key Files

- `app/api/chat/route.ts` - API route proxying to Dify, handles SSE streaming
- `lib/dify.ts` - Client-side streaming message handler
- `components/chat.tsx` - Main chat UI component
- `components/ui/` - shadcn/ui components

### Data Flow

1. User sends message via `Chat` component
2. `sendMessageStream()` in `lib/dify.ts` calls `/api/chat`
3. API route streams response from Dify API
4. Streaming chunks update UI in real-time

## Environment Variables

- `DIFY_API_URL` - Dify API base URL (default: https://api.dify.ai/v1)
- `DIFY_API_KEY` - Dify API key (required)
