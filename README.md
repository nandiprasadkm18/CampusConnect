# CampusConnect 🚀

CampusConnect is a modern, full-stack application designed to digitize and streamline essential workflows within a college campus. It provides a centralized platform for announcements, event management, workshop registrations, and real-time student collaborations.

---

## 🌟 Key Features

- **🔔 Real-time Notifications**: Instant updates for college events, department announcements, and alerts using Socket.io.
- **📅 Event & Workshop Management**: Comprehensive system for creating, viewing, and managing campus events and workshops.
- **📊 Analytics Dashboard**: Visual representation of campus activities and participation using Recharts.
- **🤝 Team Collaborations**: Feature for students to form teams, send/accept invitations, and collaborate on projects.
- **🛡️ Role-Based Access**: Secure access control for Students and Admins (Admins can manage visibility and post updates).
- **📱 Responsive UI**: A premium, mobile-first design built with Tailwind CSS and Framer Motion for smooth animations.
- **🔍 QR Code Integration**: Integrated QR code generation and scanning for event check-ins and verification.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **State/API**: [Axios](https://axios-http.com/), Context API
- **Real-time**: [Socket.io-client](https://socket.io/docs/v4/client-api/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Real-time**: [Socket.io](https://socket.io/)
- **Auth**: [JSON Web Tokens (JWT)](https://jwt.io/), [Bcryptjs](https://www.npmjs.com/package/bcryptjs)
- **File Uploads**: [Multer](https://github.com/expressjs/multer), [Cloudinary](https://cloudinary.com/)

---

## 📂 Project Structure

```text
CampusConnect/
├── backend/            # Express server, MongoDB models, API routes, and Socket logic
│   ├── middleware/     # Auth and validation middlewares
│   ├── models/         # Mongoose schemas (User, Event, Notification, etc.)
│   ├── routes/         # API endpoints
│   ├── utils/          # Helper functions (Cloudinary, JWT)
│   └── server.js       # Entry point
└── frontend/           # React client application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Feature-specific pages (Dashboard, Events, etc.)
    │   ├── App.jsx     # Main application component
    │   └── main.jsx    # Entry point
    └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Atlas or Local)
- Cloudinary Account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nandiprasad/CampusConnect.git
   cd CampusConnect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend:
   ```bash
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the ISC License.
