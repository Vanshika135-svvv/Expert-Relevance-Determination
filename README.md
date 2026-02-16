# Nexus RAC // Expert Relevance Determination System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/Python-3.13-green)
![Flask](https://img.shields.io/badge/Flask-Web%20App-orange)
![License](https://img.shields.io/badge/License-Academic-lightgrey)

An AI-powered decision support system developed for the **Recruitment and Assessment Centre (RAC)** under **DRDO, Ministry of Defence**. This system automates the selection of board members by matching subject experts with candidate expertise and interview board domains.

---

## 🚀 Overview

In large organizations like DRDO, manually matching expert profiles to interview boards is a time-intensive challenge. **Nexus RAC** solves this by using Natural Language Processing (NLP) to calculate a "Relevancy Score," ensuring that the most qualified and experienced experts are selected for every interview.

### ✨ Key Features
- **AI Matching Engine**: Implements TF-IDF Vectorization and Cosine Similarity for precise skill matching.
- **Hybrid Scoring Algorithm**: Ranks experts based on technical relevance (70%) and professional seniority/experience (30%).
- **Modern Tech Aesthetic**: A Gen Z-inspired "Glassmorphism" Dark Mode UI for an intuitive user experience.
- **Data-Driven**: Integrated with comprehensive candidate and expert datasets.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | Python (Flask) |
| **AI/ML** | Scikit-Learn (TF-IDF, Cosine Similarity) |
| **Data Handling** | Pandas, NumPy |
| **Frontend** | HTML5, CSS3 (Glassmorphism), Jinja2 |
| **Version Control** | Git & GitHub |

---

## 📁 Project Structure

```text
Expert_relevance/
│
├── data/               # CSV Datasets (Candidate & Expert profiles)
├── src/                # Core logic (Text processing & Similarity engine)
├── static/             # Assets (Modern CSS styles)
├── templates/          # Jinja2 HTML templates
└── main.py             # Main Flask application entry point

## ⚙️ Installation & Setup
Clone the Repository

Bash
git clone [https://github.com/Vanshika135-svvv/Expert-Relevance-Determination.git](https://github.com/Vanshika135-svvv/Expert-Relevance-Determination.git)
cd Expert-Relevance-Determination
Install Dependencies

Bash
pip install flask pandas scikit-learn
Run the Application

Bash
python main.py
The system will be live at http://127.0.0.1:5000

## 🧠 Methodology (How it Works)
The system follows a 4-layer logical process:

Preprocessing: Cleans raw text data by removing punctuation and stop-words.

Vectorization: Converts expertise text into numerical vectors using TF-IDF.

Similarity Calculation: Uses Cosine Similarity to find the mathematical "distance" between candidate and expert.

Weighted Ranking: Combines the matching score with an experience-based weight to output the final suitability rank.

## 👥 Team Aegis AI
Vanshika Tiwari (Team Leader & Backend Developer)

Dhanshri (Data Analyst)

Harman (Frontend Developer)

Vaidika (Documentation Specialist)

Project Guide: Ms. Juhi Shrivastava

© 2026 Nexus RAC System | SVVV Minor Project