from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS  # Standard for React integration
from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash # Security imports

# Import custom AI logic from the src folder
from src.text_processor import preprocess_text
from src.relevance_engine import calculate_similarity

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ==========================================
# 1. CONFIGURATION & DIRECTORY SETUP
# ==========================================
CORS(app)

# Vault Storage Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'docx', 'png', 'jpg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ==========================================
# 2. DATABASE CONNECTION
# ==========================================
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("\n" + "="*50)
    print("CRITICAL ERROR: MONGO_URI is missing!")
    print("Make sure you have a .env file in your backend folder.")
    print("="*50 + "\n")

# Connect to DB
client = MongoClient(MONGO_URI)
db = client['NexusRAC']
experts_col = db['experts']
users_col = db['users']
interviews_col = db['interviews']
vault_col = db['vault'] # Metadata for uploaded files
assessments_col = db['assessments'] # Collection for storing Expert Evaluations

# ==========================================
# 3. BACKEND API ROUTES
# ==========================================

@app.route('/')
def index():
    return jsonify({
        "status": "Success",
        "message": "Nexus RAC Flask Backend is running!",
        "version": "1.4.0"
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

# --- SECURE SIGNUP ROUTE ---
@app.route('/api/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        
        # Check for duplicates (Username or Email)
        existing_user = users_col.find_one({
            "$or": [
                {"username": data['username']},
                {"email": data['email']}
            ]
        })
        
        if existing_user:
            return jsonify({"status": "Error", "message": "Username or Email already registered."}), 400

        # Hash the password
        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

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
        user = users_col.find_one({
            "$or": [
                {"username": data['username']},
                {"email": data['username']}
            ]
        })

        if user and check_password_hash(user['password'], data['password']):
            return jsonify({
                "status": "Success",
                "role": user['role'],
                "username": user['username'],
                "skills": user.get('skills', 'N/A')
            })
        else:
            return jsonify({"status": "Error", "message": "Invalid credentials."}), 401
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

# --- AI PROFILE AUDITOR (Skill Fresher Feature) ---
@app.route('/api/audit', methods=['POST'])
def audit_profile():
    try:
        data = request.json
        skills = data.get('skills', '').lower()
        
        # Neural Feedback Logic
        feedback = "Your profile is strong in technical implementation. "
        if "python" in skills or "ai" in skills:
            feedback += "Consider adding specific frameworks like PyTorch or TensorFlow to increase your Expert Relevance score."
        elif "react" in skills:
            feedback += "Focus on Advanced Design Patterns or State Management (Redux/Zustand) to reach Senior Expert levels."
        else:
            feedback += "Expand your Skill Vector with core industry technologies to trigger more high-level matches."

        return jsonify({"feedback": feedback})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- SECURE FILE VAULT: UPLOAD ---
@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "Error", "message": "No file part"}), 400
        
        file = request.files['file']
        username = request.form.get('username') 

        if file.filename == '':
            return jsonify({"status": "Error", "message": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to prevent name collisions
            timestamped_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], timestamped_name)
            file.save(file_path)

            # Store metadata
            vault_col.insert_one({
                "username": username,
                "filename": filename,
                "server_filename": timestamped_name,
                "upload_date": datetime.now(),
                "size": f"{os.path.getsize(file_path) / 1024:.2f} KB"
            })

            return jsonify({"status": "Success", "filename": filename})
        
        return jsonify({"status": "Error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

# --- SECURE FILE VAULT: RETRIEVE ---
@app.route('/api/vault/<username>', methods=['GET'])
def get_vault_files(username):
    try:
        user_files = list(vault_col.find({"username": username}, {"_id": 0}))
        return jsonify(user_files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

# --- AI MATCHING ROUTE ---
@app.route('/api/match', methods=['POST'])
def match_expert():
    data = request.get_json()
    candidate_skills = data.get('skills', '')
    current_user = data.get('username', 'Unknown Candidate')      

    if not candidate_skills or candidate_skills.strip() == "":
        return jsonify({"error": "Profile skills are required for AI matching"}), 400

    try:
        latest_board = interviews_col.find_one({"status": "Live"}, sort=[("createdAt", -1)])
        board_subject = latest_board["boardSubject"] if latest_board else None

        experts_data = list(experts_col.find({}, {'_id': 0}))
        if not experts_data:
            return jsonify([]), 404

        experts_df = pd.DataFrame(experts_data)
        clean_candidate = preprocess_text(candidate_skills)
        
        name_col = 'ExpertName' if 'ExpertName' in experts_df.columns else 'name'
        sub_col = 'ExpertSubject' if 'ExpertSubject' in experts_df.columns else 'domain'
        
        experts_df['combined_profile'] = experts_df[sub_col].astype(str)
        clean_profiles = experts_df['combined_profile'].apply(preprocess_text).tolist()
        
        scores = calculate_similarity(clean_candidate, clean_profiles)
        experts_df['relevance_score'] = (scores * 100).round(2)
        
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

        results = sorted(results, key=lambda x: x['score'], reverse=True)

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


# --- EXPERT ASSESSMENT LOGGING ROUTE ---
@app.route('/api/assessments', methods=['POST'])
def save_assessment():
    try:
        data = request.get_json()
        
        # Create the document structure
        assessment_doc = {
            "expert_name": data.get('expert_name'),
            "candidate_name": data.get('candidate_name'),
            "score": data.get('score'),
            "remarks": data.get('remarks', ''),
            "timestamp": datetime.utcnow()
        }
        
        # Insert into MongoDB
        assessments_col.insert_one(assessment_doc)
        
        return jsonify({"status": "Success", "message": "Assessment recorded securely."})
        
    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"status": "Error", "message": "Failed to record assessment."}), 500


# --- NEW: RETRIEVE EXPERT ASSESSMENT ROUTE ---
@app.route('/api/assessments/<candidate_name>', methods=['GET'])
def get_candidate_assessment(candidate_name):
    try:
        # Fetch the most recent assessment for this specific candidate
        assessment = assessments_col.find_one(
            {"candidate_name": candidate_name},
            sort=[("timestamp", -1)], # Retrieves the newest evaluation
            projection={"_id": 0} # Hides the MongoDB ObjectID from the frontend
        )
        
        if assessment:
            return jsonify({"status": "Success", "data": assessment})
        else:
            # If the expert hasn't submitted yet, return a 404 Pending status
            return jsonify({"status": "Pending", "message": "No assessment found yet."}), 404
            
    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"status": "Error", "message": "Failed to fetch assessment."}), 500


# ==========================================
# 4. RUN THE SERVER
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)