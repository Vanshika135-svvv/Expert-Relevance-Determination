.

🚀 Nexus **RAC** | Expert Relevance Determination System Nexus **RAC** (Relevance-based Automated Coordination) is an AI-powered neural matching engine designed to bridge the gap between candidate skillsets and expert domains. Developed by Team Aegis AI, this system leverages Natural Language Processing (**NLP**) to ensure that technical evaluations are handled by the most relevant professionals, specifically optimized for the Recruitment and Assessment Centre (**RAC**) workflow.

💎 Key Features Neural Relevance Engine: Uses TF-**IDF** vectorization and Cosine Similarity to match profiles with high mathematical precision.

Hybrid Scoring Logic: A final relevance score is generated using a weighted formula:

70% Weight: Technical skill alignment (**NLP** Similarity).

30% Weight: Professional seniority (Years of Experience).

Glassmorphism UI: A premium React dashboard featuring dark-mode aesthetics, glowing neural elements, and fluid animations.

Role-Based Access Control (**RBAC**): Specialized, secure environments for Administrators, Experts, and Candidates.

Secure Authentication: Industry-standard password hashing using **PBKDF2** with **SHA**-**256**.

Real-time Board Sync: Automated assignment of top-ranked experts to live interview sessions stored in MongoDB.

🛠️ Technical Stack Frontend Framework: React 18

Styling: Tailwind **CSS** (Glassmorphism UI)

Animations: Framer Motion

Icons: Lucide-React

Backend Language: Python 3.11+

Framework: Flask

Database: MongoDB Atlas (NoSQL)

AI/ML Libraries: Scikit-Learn, Pandas, NumPy

🧠 The AI Engine (Methodology) The *Brain* of Nexus **RAC** follows a 4-layer **NLP** pipeline to determine expertise relevance:

Preprocessing: Raw input is cleaned by removing punctuation, converting to lowercase, and filtering out *stop-words* (e.g., and, the, with).

TF-**IDF** Vectorization: Technical skills and course descriptions are converted into numerical frequency vectors.

Similarity Calculation: The system calculates the Cosine Similarity between the candidate's vector and all available expert vectors.

Ranking: Experts are ranked based on the hybrid score, ensuring a balance between niche technical knowledge and career experience.

📂 Project Structure Based on the latest repository architecture:

Plaintext EXPERT_RELEVANCE/ ├── backend/ │   ├── src/ │   │   ├── __init__.py │   │   ├── relevance_engine.py  # TF-**IDF** & Similarity Logic │   │   └── text_processor.py    # **NLP** Cleaning & Normalization │   ├── .env                     # Database Secrets & Config │   ├── main.py                  # Flask **API** Entry Point │   └── .venv/                   # Python Virtual Environment ├── frontend/ │   ├── public/                  # Static Assets & index.html │   ├── src/ │   │   ├── components/          # Admin, Expert, & Candidate Dashboards │   │   ├── App.js               # Routing & Security Shields │   │   ├── App.css              # Custom Global Styles │   │   └── index.js             # React Entry Point │   ├── package.json             # JS Dependencies │   └── tailwind.config.js       # UI Design System └── **README**.md 🚀 Installation & Setup ## Clone the Repository Bash git clone [https://github.com/Vanshika135-svvv/Expert-Relevance-Determination.git](https://github.com/Vanshika135-svvv/Expert-Relevance-Determination.git) cd Expert-Relevance-Determination ## Backend Configuration Bash cd backend python -m venv .venv source .venv/bin/activate  # Windows: .venv\Scripts\activate pip install flask pandas scikit-learn pymongo python-dotenv # Create a .env file and add: MONGO_URI=your_mongodb_string python main.py ## Frontend Configuration Bash cd frontend npm install npm start 👥 Team Aegis AI Vanshika Tiwari — Team Leader & Backend Architect

Dhanshri — Data Analyst & ML Logic

Harman — Frontend Developer

Vaidika — Documentation Specialist

Project Guide: Ms. Juhi Shrivastava

Organization: Shri Vaishnav Vidyapeeth Vishwavidyalaya (**SVVV**)

Collaboration: **SVVV** Minor Project (**CSE** AI-**IBM**)