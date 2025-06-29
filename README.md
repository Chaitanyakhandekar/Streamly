# 🎬 Streamly – Your Ultimate Video Streaming Platform

**Streamly** is a full-stack YouTube-inspired video platform where users can upload, like, comment, and organize videos into playlists. Built with modern technologies and production-grade architecture, it’s designed for **speed, scalability, and clean API interaction**.

---

## 🚀 Tech Stack

| Layer           | Tech Used                            |
|------------------|----------------------------------------|
| Frontend         | React.js *(Planned)*                  |
| Backend          | Node.js, Express.js                   |
| Database         | MongoDB + Mongoose                    |
| Authentication   | JWT (Access + Refresh Tokens)         |
| Cloud Storage    | Cloudinary                            |
| File Uploads     | Multer                                |
| API Testing      | Postman                               |

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

- Create / Update / Delete your own playlists
- Add / Remove videos to/from playlists
- Fetch videos from a specific playlist with pagination

---

## 💬 Comment System

- Add comments to any video
- Like / Unlike comments
- Delete your own comments
- Get comments count with pagination

---

## ❤️ Like System

- Toggle like/unlike on Videos, Comments, Tweets
- Get all likes with user info
- Clean likes on deletion of parent (video/comment/tweet)
- "IsLiked" status service for UI

---

## 📦 API Documentation

🔗 Explore the full Postman collection below:  
**📘 [Streamly API Collection (Postman)](https://chaitanya-7904147.postman.co/workspace/chaitanya's-Workspace~4d123e95-d3c8-43f9-8cdf-6ca088785c63/collection/45095694-ba5e6a6d-705d-4a38-81a9-bd89ba8d7520?action=share&source=copy-link&creator=45095694)**

Includes:
- ✅ Auth flow
- ✅ Video routes
- ✅ Like/Unlike logic
- ✅ Playlist management
- ✅ Comments system
- ✅ Headers, Query Params, & Sample Responses

> 💡 Coming Soon: Swagger UI Documentation

---

## 🖼️ Screenshots

> 📷 *Frontend is under development – Stay tuned for updates!*

---

## 🤝 Contribution
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change

---

## 📬 Contact
Made with ❤️ by Chaitanya
Follow for more full-stack projects and open-source work.

---

## Let me know if you also want a version with Markdown badges, contributors section, license, or frontend instructions once it's built.

## 🛠️ Installation

```bash
git clone https://github.com/yourusername/streamly.git
cd streamly
npm install
npm run dev
