# 🚀 CampusConnect

CampusConnect aims to digitize the essential workflows of a college campus by offering features like announcements, event listings, admin controls, and easy access to critical campus information. With separate front-end and back-end modules, the project is cleanly organized for scalability and future expansion.

## 🌟 Key Features

* **🔔 Announcements & Notifications:** Instant updates for college events, department announcements, and alerts. Organized notice board interface.
* **🎉 Event & Workshop Management:** View upcoming events and workshops with details. Filter by date, club, or department.
* **👨‍🎓 Role-Based Access:** 
  * Students can register for events, view announcements and workshops.
  * Admins can create events, post notices, upload data, and manage visibility.
* **📱 Responsive UI:** Clean, light-themed, and responsive UI built with Tailwind CSS that works on mobile, tablet, and desktop seamlessly.
* **🤖 Smart Assistant:** Integrated chatbot for quick campus help.
* **🛡️ Secure API Layer:** Protected routes, JWT-based authentication, and structured controllers.

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Framer Motion
* **Backend:** Node.js, Express, MongoDB, Mongoose
* **Authentication:** JWT (JSON Web Tokens), bcryptjs

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

* Node.js installed
* MongoDB connection string (setup via a `.env` file in the backend folder)

### Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on port 5000):
   ```bash
   npm start
   ```

### Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173/`) to view CampusConnect!
