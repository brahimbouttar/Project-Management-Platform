# ProjectHub — AI-Powered Project Management Platform

A full-stack project management platform combining Jira-like task management, Notion-like docs, Trello-like boards, and Slack-like chat.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 4 |
| State | TanStack Query, Zustand |
| Drag & Drop | @hello-pangea/dnd |
| Rich Text | TipTap Editor |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |
| UI Icons | Lucide React |

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or [Neon](https://neon.tech) for cloud)
- npm or yarn

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd project-hub
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| User | user@demo.com | demo123 |

## Features

- ✅ Workspaces with team management
- ✅ Projects with Kanban boards (drag-and-drop)
- ✅ Task management with priorities, labels, assignees, due dates
- ✅ Rich text pages (Notion-like editor)
- ✅ Real-time chat with channels
- ✅ Real-time notifications
- ✅ JWT authentication
- ✅ Responsive design
- ✅ Dark theme sidebar

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` to your backend URL on Render/Railway.

### Backend → Render

Build command: `npm install && npm run build`  
Start command: `npm start`

Environment variables needed:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `FRONTEND_URL`

### Database → Neon

Create a free PostgreSQL database on [Neon](https://neon.tech) and copy the connection string to `DATABASE_URL`.
