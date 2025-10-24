# 💬 Web-Based Chat System

A **real-time chat application** where users can send and accept friend requests, manage chat rooms, and communicate seamlessly — built with **GraphQL**, **React**, **Node.js**, and **Prisma**.

This project was created to deeply understand **how chat systems work under the hood**, focusing on the **data flow**, **GraphQL API design**, and **real-time communication structure** between users.

---

## 🚀 Features

✅ User authentication and session management  
✅ Send, accept, and manage friend requests  
✅ Create and join private chat rooms  
✅ Real-time messaging using GraphQL queries and mutations  
✅ Dynamic UI built with TailwindCSS  
✅ Scalable backend structure using Prisma ORM and PostgreSQL  
✅ Clean, modular frontend with React and Apollo Client

---

## 🧠 Learning Goals

This project helped me learn:

- How **GraphQL** handles structured communication between client and server  
- Designing **API schemas** that scale with user relationships (friends, rooms, messages)  
- Managing **real-time user state** (active friends, online/offline status)  
- How **Prisma ORM** simplifies database operations and maintains relationships  
- Frontend integration using **Apollo Client** and **React hooks**  
- UI design principles — **responsive**, **clean**, and **consistent**

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js, Apollo Client, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **API** | GraphQL (Apollo Server) |
| **Database** | PostgreSQL with Prisma ORM |
| **Other Tools** | JWT for auth, ESLint + Prettier for code quality |

---

## 🧱 Project Structure

```
📦 web-chat-system
├── 📁 client           # Frontend (React + Apollo Client)
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.tsx
│
├── 📁 server           # Backend (Node.js + GraphQL)
│   ├── prisma/         # Prisma schema & migrations
│   ├── src/
│   │   ├── resolvers/
│   │   ├── schema/
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 🖥️ Prerequisites
- Node.js v18+  
- PostgreSQL installed locally  
- npm or yarn package manager  

### 🔧 Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/web-chat-system.git
   cd web-chat-system
   ```

2. **Setup the backend**
   ```bash
   cd server
   npm install
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup the frontend**
   ```bash
   cd ../client
   npm install
   npm start
   ```

4. **Connect to the backend**
   Make sure the backend server (GraphQL API) runs before starting the frontend.

---

## 🖼️ Preview

| Login / Register | Chat Room | Notification UI |
|------------------|------------|-------------|
| ![Login](<img width="1920" height="1080" alt="Screenshot from 2025-10-24 17-12-17" src="https://github.com/user-attachments/assets/5fc27136-fa29-4e68-ae85-436b1b61af0f" />
) | ![Chat](<img width="1920" height="1080" alt="Screenshot from 2025-10-24 17-15-13" src="https://github.com/user-attachments/assets/1dd302de-ae20-48f3-9130-3dc5ca28f1e6" />
) | ![Notification](<img width="1920" height="1080" alt="Screenshot from 2025-10-24 17-14-52" src="https://github.com/user-attachments/assets/1c2b51c5-66a1-47a8-9d86-10ea4d6555d5" />
) |

---

## 🧩 Future Improvements

- WebSocket / GraphQL Subscriptions for real-time updates  
- Typing indicators and message delivery status  
- Group chat rooms  
- Notifications system  
- Profile customization with image upload  

---

## 🧑‍💻 Author

**Ritik Sharma**  
💼 Aspiring Full Stack Developer | Learning by Building  
🔗 [LinkedIn](https://linkedin.com/in/type-ritik)  
🌐 [Portfolio](Working...)
