# 🚀 Aegis RAC | Expert Relevance Determination System

**Aegis RAC (Relevance-based Automated Coordination)** is an AI-powered neural matching engine designed to bridge the gap between **candidate skillsets and expert domains**.

Developed by **Team Aegis AI**, this system leverages **Natural Language Processing (NLP)** to ensure that technical evaluations are handled by the most relevant professionals. It is specifically optimized for the **Recruitment and Assessment Centre (RAC)** workflow.

---

# 💎 Key Features

### Neural Relevance Engine
Uses **TF-IDF vectorization** and **Cosine Similarity** to match profiles with high mathematical precision.

### Hybrid Scoring Logic
A final relevance score is generated using a weighted formula:

- **70% Weight:** Technical skill alignment (NLP Similarity)  
- **30% Weight:** Professional seniority (Years of Experience)

### Glassmorphism UI
A premium **React dashboard** featuring dark-mode aesthetics, glowing neural elements, and fluid animations.

### Role-Based Access Control (RBAC)
Specialized and secure environments for:
- Administrators
- Experts
- Candidates

### Secure Authentication
Industry-standard password hashing using **PBKDF2 with SHA-256**.

### Real-time Board Sync
Automated assignment of top-ranked experts to **live interview sessions stored in MongoDB**.

---

# 🛠️ Technical Stack

### Frontend
- **Framework:** React 18  
- **Styling:** Tailwind CSS (Glassmorphism UI)  
- **Animations:** Framer Motion  
- **Icons:** Lucide React  

### Backend
- **Language:** Python 3.11+  
- **Framework:** Flask  
- **Database:** MongoDB Atlas (NoSQL)

### AI / ML Libraries
- Scikit-Learn  
- Pandas  
- NumPy  

---

# 🧠 The AI Engine (Methodology)

The **brain of Aegis RAC** follows a **4-layer NLP pipeline** to determine expertise relevance.

### 1️⃣ Preprocessing
Raw input is cleaned by:
- Removing punctuation
- Converting to lowercase
- Removing stop words (e.g., *and, the, with*)

### 2️⃣ TF-IDF Vectorization
Technical skills and course descriptions are converted into **numerical frequency vectors**.

### 3️⃣ Similarity Calculation
The system calculates **Cosine Similarity** between:

- Candidate skill vector  
- Available expert vectors

### 4️⃣ Ranking
Experts are ranked using the **hybrid scoring model**, balancing:

- Technical knowledge  
- Professional experience

---

# 📂 Project Structure

Based on the latest repository architecture:
```
EXPERT_RELEVANCE/

├── backend/
│ ├── src/
│ │ ├── init.py
│ │ ├── relevance_engine.py # TF-IDF & similarity logic
│ │ └── text_processor.py # NLP cleaning & normalization
│ │
│ ├── .env # Database secrets & configuration
│ ├── main.py # Flask API entry point
│ └── .venv/ # Python virtual environment
│
├── frontend/
│ ├── public/ # Static assets & index.html
│ │
│ ├── src/
│ │ ├── components/ # Admin, Expert & Candidate dashboards
│ │ ├── App.js # Routing & security shields
│ │ ├── App.css # Global styles
│ │ └── index.js # React entry point
│ │
│ ├── package.json # JavaScript dependencies
│ └── tailwind.config.js # UI design system
│
└── README.md

```

---

# 🚀 Installation & Setup

## Clone the Repository

```bash
git clone https://github.com/Vanshika135-svvv/Expert-Relevance-Determination.git
cd Expert-Relevance-
```
⚙️ Backend Configuration
```
cd backend

python -m venv .venv
```
# Activate environment
# Windows
```
.venv\Scripts\activate
```
# Linux / Mac
```
source .venv/bin/activate
```
```
pip install flask pandas scikit-learn pymongo python-dotenv
```
Create a .env file and add:
```
MONGO_URI=your_mongodb_string
```
Run the backend:
```
python main.py
```
💻 Frontend Configuration
```
cd frontend

npm install
npm start
```
Full Run Command
``` 
npm run dev
``` 
## 👥 Team Aegis AI

### Team Members

**Vanshika Tiwari**  
*Team Leader & Backend Architect*

**Dhanshri**  
*Data Analyst & ML Logic*

**Harman**  
*Frontend Developer*

**Vaidika**  
*Documentation Specialist*

---

### 🎓 Project Guide
**Prof. Rohit Choubey**

---

### 🏫 Organization
**Shri Vaishnav Vidyapeeth Vishwavidyalaya (SVVV)**

---

### 🤝 Collaboration
**SVVV FML Project — CSE (AI-IBM)**
