# TED Manager – Personal TED / TED-Ed / TEDx Video Tracker

A full-stack MERN app that lets users browse, favorite, mark as watched, remove functions for TED, TED-Ed, and TEDx videos with all-time popular sorting.

## Features

- Three channels: TED, TED-Ed, TEDx
- Five views: Recent, Popular (all-time by view count), Bucket (unwatched & not skipped), Favourites, Watched(skipped)
- Per-channel independent Bucket/Favourite/Watched lists
- Infinite scroll + real pagination
- Embedded YouTube player modal (auto marks as watched)
- Responsive design (mobile & desktop)
- User authentication (JWT)
- Auto-syncs thousands of videos using Uploads playlist (low quota)

## Tech Stack

- Frontend: React 18 + Vite + TailwindCSS + Lucide icons
- Backend: Node.js + Express + MongoDB (Mongoose)

## Quick Start

```bash
# Backend
cd server
cp .env.example .env
# Fill MONGODB_URI, JWT_SECRET, YOUTUBE_API_KEY (default)
npm install
npm run dev

# Frontend
cd client
cp .env.example .env
# Set VITE_API_URL=http://localhost:5001/api
npm install
npm run dev
```
