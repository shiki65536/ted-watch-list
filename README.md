# TED Manager – Personal TED / TED-Ed / TEDx Video Tracker

A full-stack MERN (MongoDB, Express, React + Vite, Node.js) app that lets you browse, favorite, mark as watched, and manage TED, TED-Ed, and TEDx videos with infinite scroll and true all-time popular sorting.

## Features

- Three channels: TED (red), TED-Ed (orange), TEDx (black)
- Five views: Recent, Popular (all-time by view count), Bucket (unwatched & not skipped), Favourites, Watched
- Per-channel independent Bucket/Favourite/Watched lists
- Infinite scroll + real pagination
- Embedded YouTube player modal (auto marks as watched)
- Responsive design (mobile → desktop)
- User authentication (JWT)
- Optional personal YouTube API key (avoids shared quota)
- Auto-syncs thousands of videos using Uploads playlist (low quota)

## Tech Stack

- Frontend: React 18 + Vite + TailwindCSS + Lucide icons
- Backend: Node.js + Express + MongoDB (Mongoose)
- Deployment-ready: Vercel/Netlify (frontend) + Render/Railway (backend)

## Quick Start

```bash
# Clone and enter
git clone https://github.com/yourname/ted-manager.git
cd ted-manager

# Backend
cd server
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, YOUTUBE_API_KEY (default)
npm install
npm run dev

# Frontend
cd ../client
cp .env.example .env
# Set VITE_API_URL=http://localhost:5001/api
npm install
npm run dev
```
