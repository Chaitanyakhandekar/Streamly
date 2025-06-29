# Streamly# 🎬 Streamly – Your Ultimate Video Streaming Platform

Streamly is a full-stack YouTube-inspired video platform where users can upload, like, comment, and organize videos into playlists. Built with modern technologies and production-grade architecture, it’s designed for **speed, scalability, and clean API interaction**.

![Streamly Banner](https://your-image-link.com/banner.jpg)

---

## 🚀 Tech Stack

| Layer        | Tech Used                               |
|--------------|------------------------------------------|
| Frontend     | React.js (Planned)                      |
| Backend      | Node.js, Express.js                    |
| Database     | MongoDB + Mongoose                     |
| Authentication | JWT (Access + Refresh Tokens)         |
| Cloud Storage| Cloudinary                             |
| File Uploads | Multer                                 |
| API Testing  | Postman                                |

---

## 🔐 Authentication Features

- Signup / Login / Logout
- JWT-based secure access
- Refresh token rotation via HttpOnly Cookies
- Password update & account management
- Avatar and cover image uploads

---

## 🎥 Video Features

- Upload videos (Cloudinary)
- Stream videos
- Like/Unlike videos
- Comment on videos
- Get like count and info
- Delete your own video or comments

---

## 📁 Playlist Management

- Create/update/delete your own playlists
- Add/remove videos to/from playlists
- Fetch videos from a specific playlist with pagination

---

## 💬 Comment System

- Add comments to any video
- Like/unlike comments
- Delete your own comments
- Get comments count with pagination

---

## ❤️ Like System

- Toggle like/unlike on videos, comments, tweets
- Get all likes with user info
- Clean likes on deletion of parent (video/comment/tweet)
- "IsLiked" status checker for UI

---

## 📦 API Documentation

- 📘 Postman Collection: [Download Here](https://your-postman-link.com)
- 🔍 Swagger UI (coming soon)
- Includes: headers, body, query params, and sample responses

---

## 📷 Screenshots

> 📍 Coming soon with frontend UI

---

## 🛠️ Installation

```bash
git clone https://github.com/yourname/streamly.git
cd streamly
npm install
npm run dev
