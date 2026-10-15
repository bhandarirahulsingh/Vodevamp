# 🧛 CodeVamp - High Performance Coding Platform

**CodeVamp** is a next-generation competitive programming platform built for speed, performance, and developer experience. It is optimized for modern cloud deployment using **Render** (backend) and **Vercel** (frontend).

![CodeVamp Banner](apps/web/public/logo.png)

---

## 🚀 Key Features

### 💻 **Advanced Code IDE**
- **Multi-Language Support**: High-performance execution for Python, C++, Java, JavaScript, C, and Go.
- **Serverless Execution**: Powered by the **Judge0 API**—no heavy background workers needed.
- **Custom Test Cases**: Run your code against specific inputs to debug effectively.
- **Rich Editor**: Premium developer experience with syntax highlighting and minimalist design.

### 🏆 **Contest System**
- **Live Contests**: Compete with others in scheduled programming challenges.
- **Real-Time Leaderboard**: Global rankings powered by WebSockets (Socket.io).
- **Difficulty Scaling**: Curated problem sets from Easy to Hard.

### 🔥 **Daily Challenges (POTD)**
- **Streak System**: Track your consistency with an automated daily problem.
- **Milestone Badges**: Earn special achievements for 3-day and 7-day streaks.

### 📊 **Integrated Profile**
- **Heatmaps**: GitHub-inspired contribution graph for solving history.
- **Stats Dashboard**: Track your solved counts by difficulty and global rank.

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (Minimal & Premium)
- **Animations**: Framer Motion
- **Hosting**: Vercel

### **Backend**
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Hosting**: Render
- **Execution**: Piston Code Execution API

---

## 🏗 Deployment (Render + Vercel)

The platform is designed for split deployment:
- Backend on Render
- Frontend on Vercel

### 1. MongoDB Setup
Ensure your **MongoDB Atlas** Network Access allows `0.0.0.0/0` (Allow Access from Anywhere) to support cloud-hosted backend access.

### 2. Environment Variables
Set these in your Render service:
- `MONGODB_URI`: Your Atlas connection string.
- `JWT_SECRET`: A strong secret key for auth.
- `NODE_ENV`: `production`

Set these in your Vercel project:
- `VITE_API_URL`: Your Render backend URL (example: `https://<service>.onrender.com`)

---

## 🚦 Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` in `apps/api/`:
   ```env
   MONGODB_URI=your_mongo_uri
   JWT_SECRET=your_secret
   NODE_ENV=development
   ```

3. **Run Services**
   ```bash
   # Start Backend
   npm run dev:api
   
   # Start Frontend
   npm run dev:web
   ```

---

## 🤝 Contact & Credits

**Made with ❤️ by [Vaibhav Joshi](Chaarismatic/CodeVamp) && [Yogesh Pant](https://github.com/yogeshpant585)**

Founder & Lead Developer of CodeVamp..
