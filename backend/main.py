from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # Standard for React integration
from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash # <-- Security imports

# Import custom AI logic from the src folder
from src.text_processor import preprocess_text
from src.relevance_engine import calculate_similarity

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ==========================================
# 1. CROSS-ORIGIN RESOURCE SHARING (CORS)
# ==========================================
CORS(app)

# ==========================================
# 2. DATABASE CONNECTION
# ==========================================
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("\n" + "="*50)
    print("CRITICAL ERROR: MONGO_URI is missing!")
    print("Check your .env file in the backend folder.")
    print("="*50 + "\n")

# Connect to DB
client = MongoClient(MONGO_URI)
db = client['NexusRAC']
experts_col = db['experts']
users_col = db['users']
interviews_col = db['interviews']

# ==========================================
# 3. BACKEND API ROUTES
# ==========================================

@app.route('/')
def index():
    return jsonify({
        "status": "Success",
        "message": "Nexus RAC Flask Backend is running!",
        "version": "1.2.0"
    })

@app.route('/api/health_check', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        e_count = experts_col.count_documents({})
        c_count = users_col.count_documents({"role": "Candidate"})
        return jsonify({
            "status": "Optimal", 
            "db_status": "Connected", 
            "experts": e_count, 
            "candidates": c_count
        })
    except Exception as e:
        return jsonify({"status": "Critical", "db_status": "Disconnected", "error": str(e)}), 500

@app.route('/api/get_logs', methods=['GET'])
def get_logs():
    try:
        logs = list(interviews_col.find().sort("createdAt", -1).limit(5))
        formatted_logs = [f"[BOARD] {log.get('boardSubject', 'Unknown')} initialized for {log.get('boardDate', 'Unknown')}" for log in logs]
        return jsonify(formatted_logs)
    except:
        return jsonify(["[ERROR] Could not fetch logs"])

# --- SECURE SIGNUP ROUTE ---
@app.route('/api/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        
        # 1. Check if username OR email already exists to prevent duplicates
        existing_user = users_col.find_one({
            "$or": [
                {"username": data['username']},
                {"email": data['email']}
            ]
        })
        
        if existing_user:
            return jsonify({"status": "Error", "message": "Username or Email already registered."}), 400

        # 2. HASH THE PASSWORD
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

        # 3. Insert user document
        users_col.insert_one({
            "username": data['username'], 
            "email": data['email'],
            "password": hashed_password, 
            "role": data['role'], 
            "skills": data.get('skills', 'N/A'),
            "createdAt": datetime.now()
        })
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

# --- SECURE LOGIN ROUTE (Email & Username Support) ---
@app.route('/api/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        
        # SEARCH FOR BOTH: This allows the "Identifier" field in React 
        # to accept either the username or the email address.
        user = users_col.find_one({
            "$or": [
                {"username": data['username']},
                {"email": data['username']}
            ]
        })

        # Verify the secure hash against the typed password
        if user and check_password_hash(user['password'], data['password']):
            return jsonify({
                "status": "Success",
                "role": user['role'],
                "username": user['username'],
                "skills": user.get('skills', 'N/A')
            })
        else:
            return jsonify({
                "status": "Error", 
                "message": "Invalid credentials. Check your identifier and security key."
            }), 401
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

@app.route('/api/create_board', methods=['POST'])
def create_board():
    try:
        data = request.get_json()
        interviews_col.insert_one({
            "boardSubject": data['subject'], 
            "boardDate": data['date'],
            "status": "Live",
            "assignedExpert": "Pending Match", 
            "candidateName": "Not Assigned",   
            "createdAt": datetime.now()
        })
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

# --- AI MATCHING ROUTE (Multi-Expert Array) ---
@app.route('/api/match', methods=['POST'])
def match_expert():
    data = request.get_json()
    candidate_skills = data.get('skills', '')
    current_user = data.get('username', 'Unknown Candidate')      

    if not candidate_skills or candidate_skills.strip() == "":
        return jsonify({"error": "Profile skills are required for AI matching"}), 400

    try:
        # 1. Fetch current board status
        latest_board = interviews_col.find_one({"status": "Live"}, sort=[("createdAt", -1)])
        board_subject = latest_board["boardSubject"] if latest_board else None

        # 2. Fetch all experts
        experts_data = list(experts_col.find({}, {'_id': 0}))
        if not experts_data:
            return jsonify([]), 404

        experts_df = pd.DataFrame(experts_data)
        clean_candidate = preprocess_text(candidate_skills)
        
        name_col = 'ExpertName' if 'ExpertName' in experts_df.columns else 'name'
        sub_col = 'ExpertSubject' if 'ExpertSubject' in experts_df.columns else 'domain'
        
        # 3. Calculate similarity for ALL experts
        experts_df['combined_profile'] = experts_df[sub_col].astype(str)
        clean_profiles = experts_df['combined_profile'].apply(preprocess_text).tolist()
        
        scores = calculate_similarity(clean_candidate, clean_profiles)
        experts_df['relevance_score'] = (scores * 100).round(2)
        
        # 4. Filter for relevant matches (10% to 100%)
        results = []
        for index, row in experts_df.iterrows():
            score = row['relevance_score']
            if 10.0 <= score <= 100.0:
                results.append({
                    "id": int(index), 
                    "expert_name": str(row[name_col]),
                    "domain": str(row[sub_col]),
                    "experience": int(row.get('experience', 5)) if 'experience' in row else 5, 
                    "score": float(score)
                })

        # 5. Sort from highest score to lowest
        results = sorted(results, key=lambda x: x['score'], reverse=True)

        # 6. Database Update: Assign top expert to the Live Board
        if board_subject and len(results) > 0:
            best_match_name = results[0]["expert_name"]
            interviews_col.update_one(
                {"boardSubject": board_subject, "status": "Live"}, 
                {"$set": {
                    "assignedExpert": best_match_name,
                    "candidateName": current_user,
                    "status": "Active" 
                }}
            )
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 4. RUN THE SERVER
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)