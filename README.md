# 🍽️ Karmic Canteen

**Karmic Canteen** is a full-stack web application designed to tackle the critical issue of **food waste in corporate canteens**.  
By introducing a smart **pre-order and analytics system**, it provides administrators with real-time data to minimize food wastage and helps employees conveniently plan their meals.  

🌐 **Live Project:** [http://karmic-canteen1.netlify.app](http://karmic-canteen1.netlify.app)

---

## 🌍 Problem Statement

In most corporate canteens, food is prepared in bulk based on rough estimates.  
This often results in a mismatch between food prepared and food consumed — causing **significant food waste**, **financial loss**, and a **negative environmental impact**.

---

## 💡 Our Solution

Karmic Canteen bridges this gap with a **data-driven dual-portal system**:

- **👨‍💼 Employee Portal:** Allows users to pre-order meals, manage schedules, and provide feedback.  
- **🧑‍🍳 Admin Dashboard:** Offers real-time analytics, tracks waste, and automates unclaimed meal detection.

The core of our solution is the **Smart Waste Automation** feature, which automatically identifies and logs any meal that is ordered but not collected — turning estimations into **exact data**.

---

## ✨ Core Features

### 🧑‍💼 Employee Portal
- **📅 Date-Based Menu:** View the menu for upcoming days and select meals.  
- **🛒 Simple Ordering:** Add breakfast, lunch, snacks, or dinner easily.  
- **💳 Payment Modal:** Clear payment modal with dynamic **QR code** and **UPI ID**.  
- **🕒 Time-Locked Cancellation:** Cancel orders before 9:00 PM to let the canteen adjust.  
- **⭐ Feedback System:** 5-star rating for food & hygiene with **sentiment analysis**.  
- **🔔 Notifications:** Receive admin broadcasts (e.g., “Are you attending the festival?”).  
- **📜 Order History:** View all past and active orders.  

### 📈 Admin Dashboard
- **📊 Real-Time Dashboard:** Live-updating overview of all orders.  
- **♻️ Smart Waste Automation:** A scheduled job auto-marks unclaimed meals as “Wasted”.  
- **📋 Live Summary Cards:** Quick stats for:  
  - ✅ Food Saved  
  - ❌ Food Wasted  
  - 🍱 Active Meal Counts  
- **📉 Analytics Suite:** Chart.js graphs for:  
  - Orders per day  
  - Meal popularity  
  - Feedback sentiment trend  
- **📢 Broadcast System:** Send notifications to all employees directly.  

---

## 🛠️ Technical Architecture

### 🖥️ Frontend (`/frontend`)
- **HTML5** — Page structure  
- **CSS3** — Custom dashboard and component styling  
- **TailwindCSS** — Modern responsive UI for login and dashboard  
- **Vanilla JavaScript (ES6+)** — Handles all client logic and routing  
- **Chart.js** — Visual analytics  

### ⚙️ Backend (`/backend`)
- **Node.js** — Runtime environment  
- **Express.js** — Server framework with routes and middleware  
- **MongoDB** — NoSQL database for users, orders, and feedback  
- **Mongoose** — ODM for structuring models  
- **JWT (JSON Web Tokens)** — For authentication and route security  
- **Cron Jobs (jobs/cronJobs.js)** — Automates Smart Waste tracking  

---

## 🚀 Getting Started

### ✅ Prerequisites
- **Node.js (v18 or higher)**  
- **MongoDB** (local or Atlas cloud instance)  

---

### ⚙️ 1. Configure the Backend

```bash
# Clone the repository
git clone https://github.com/your-username/karmic-canteen.git
cd karmic-canteen/backend

# Install dependencies
npm install
```

#### Create a `.env` file inside `/backend`  
Add the following values (based on `config/db.js` and `middleware/auth.js`):

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
```

---

### ▶️ 2. Run the Backend

```bash
# Start the backend server
npm start
```

Backend runs on **http://localhost:5000** (or your configured port).

---

### 💻 3. Run the Frontend

The frontend is static and doesn’t require installation.

```bash
cd ../frontend
open index.html
# or (Windows)
start index.html
```

---

## 🧠 Smart Waste Automation

The automation script (`jobs/cronJobs.js`) runs periodically to detect any orders marked as “Active” past their mealtime.  
If not collected, the system automatically updates their status to **“Unclaimed”**, increasing the **Food Wasted** counter — ensuring accurate analytics for admins.

---

## 👥 Hackathon Team

| Role | Name |
|------|------|
| 🧠 Leader | **Ashel Pinto** |
| 👨‍💻 Member | **Jeevan Dsouza** |
| 👨‍💻 Member | **Nihal P K** |
| 👩‍💻 Member | **Durgashree** |

---

## 🏆 Hackathon Project Goal

To **automate meal planning and minimize food waste** using smart analytics and real-time monitoring — aligning with the **Sustainable Development Goal (SDG) 12: Responsible Consumption and Production**.

---

## ❤️ Acknowledgments

- Built as part of a **Hackathon Project** initiative.  
- Thanks to mentors and judges for their valuable feedback.  
- Inspired by the vision of creating a **zero-waste canteen system**.

---

## 📜 License

This project is open-source under the **MIT License**.  
You are free to use, modify, and distribute with attribution.

---

### ✨ “Eat Smart, Save the Planet — One Meal at a Time.” 🌱
