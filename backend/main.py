from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Standard for React integration
from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
import pandas as pd
import os
import io
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 

# Import custom AI logic from the src folder
from src.text_processor import preprocess_text
from src.relevance_engine import calculate_similarity

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================
CORS(app)

ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'docx', 'png', 'jpg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ==========================================
# 2. DATABASE CONNECTION & GRIDFS BUCKET
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

# Define Collections
experts_col = db['experts']
users_col = db['users']
interviews_col = db['interviews']
vault_col = db['vault'] # Metadata for general uploaded files
assessments_col = db['assessments'] 
resumes_col = db['resumes'] # NEW: Collection for Primary Resumes

# Initialize MongoDB GridFS Bucket 
fs = GridFS(db)


# ==========================================
# 3. BACKEND API ROUTES
# ==========================================

@app.route('/')
def index():
    return jsonify({
        "status": "Success", 
        "message": "Nexus RAC Flask Backend Running!",
        "version": "2.2.0 (Resume Sync Enabled)"
    })


@app.route('/api/health_check', methods=['GET'])
def health_check():
    try:
        client.admin.command('ping')
        return jsonify({"status": "Optimal", "db_status": "Connected"})
    except Exception as e:
        return jsonify({"status": "Critical", "db_status": "Disconnected", "error": str(e)}), 500


# --- SECURE SIGNUP ROUTE ---
@app.route('/api/signup', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        existing_user = users_col.find_one({
            "$or": [{"username": data['username']}, {"email": data['email']}]
        })
        
        if existing_user:
            return jsonify({"status": "Error", "message": "Username or Email already registered."}), 400

        hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        users_col.insert_one({
            "username": data['username'], 
            "email": data['email'],
            "password": hashed_password, 
            "role": data['role'], 
            "skills": data.get('skills', 'N/A'),
            "createdAt": datetime.utcnow()
        })
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


# --- SECURE LOGIN ROUTE ---
@app.route('/api/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        user = users_col.find_one({
            "$or": [{"username": data['username']}, {"email": data['username']}]
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


# --- AI PROFILE AUDITOR ---
@app.route('/api/audit', methods=['POST'])
def audit_profile():
    data = request.json
    skills = data.get('skills', '').lower()
    
    feedback = "Your profile is strong in technical implementation. "
    if "python" in skills or "ai" in skills:
        feedback += "Consider adding frameworks like PyTorch or TensorFlow to increase relevance."
    elif "react" in skills:
        feedback += "Focus on Advanced Design Patterns to reach Senior Expert levels."
    else:
        feedback += "Expand your Skill Vector with core industry technologies."
        
    return jsonify({"feedback": feedback})


# --- NEW: PRIMARY RESUME UPLOAD DIRECTLY TO GRIDFS ---
@app.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "Error", "message": "No file part"}), 400
        
        file = request.files['file']
        username = request.form.get('username') 

        if file.filename == '':
            return jsonify({"status": "Error", "message": "No selected file"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            
            # Put file directly into MongoDB GridFS bucket
            file_id = fs.put(file, filename=filename, metadata={"username": username, "type": "primary_resume"}, content_type=file.content_type)

            # Store metadata safely in the NEW Resumes collection
            resumes_col.insert_one({
                "username": username,
                "filename": filename,
                "gridfs_id": file_id,
                "upload_date": datetime.utcnow(),
                "size": f"{file_length / 1024:.2f} KB"
            })

            return jsonify({"status": "Success", "filename": filename})
        
        return jsonify({"status": "Error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


# --- SECURE FILE VAULT: UPLOAD DIRECTLY TO MONGODB GRIDFS ---
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
            
            file.seek(0, os.SEEK_END)
            file_length = file.tell()
            file.seek(0)
            
            file_id = fs.put(file, filename=filename, metadata={"username": username}, content_type=file.content_type)

            vault_col.insert_one({
                "username": username,
                "filename": filename,
                "gridfs_id": file_id,
                "upload_date": datetime.utcnow(),
                "size": f"{file_length / 1024:.2f} KB"
            })

            return jsonify({"status": "Success", "filename": filename})
        
        return jsonify({"status": "Error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


# --- SECURE FILE VAULT: RETRIEVE LIST ---
@app.route('/api/vault/<username>', methods=['GET'])
def get_vault_files(username):
    try:
        user_files = list(vault_col.find({"username": username}))
        for f in user_files:
            f['_id'] = str(f['_id'])
            f['gridfs_id'] = str(f.get('gridfs_id', f['_id'])) 
        return jsonify(user_files)
    except Exception as e:
        print(f"Vault Fetch Error: {e}")
        return jsonify({"error": str(e)}), 500


# --- VIEW FILE DIRECTLY FROM MONGODB ---
@app.route('/api/vault/view/<file_id>', methods=['GET'])
def view_file(file_id):
    try:
        grid_out = fs.get(ObjectId(file_id))
        return send_file(
            io.BytesIO(grid_out.read()),
            mimetype=grid_out.content_type or 'application/octet-stream',
            download_name=grid_out.filename,
            as_attachment=False 
        )
    except Exception as e:
        print(f"Error serving file: {e}")
        return jsonify({"error": "File not found or corrupted. May be a legacy file."}), 404


# --- DELETE FILE FROM MONGODB ---
@app.route('/api/vault/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        try:
            fs.delete(ObjectId(file_id))
        except:
            pass 
        
        vault_col.delete_one({"$or": [{"gridfs_id": ObjectId(file_id)}, {"_id": ObjectId(file_id)}]})
        
        return jsonify({"status": "Success", "message": "File deleted securely."})
    except Exception as e:
        print(f"Delete Error: {e}")
        return jsonify({"status": "Error", "message": "Failed to delete file."}), 500


# --- LIVE BOARD CREATION ROUTE ---
@app.route('/api/create_board', methods=['POST'])
def create_board():
    data = request.get_json()
    interviews_col.insert_one({
        "boardSubject": data['subject'], 
        "boardDate": data['date'], 
        "status": "Live",
        "assignedExpert": "Pending Match", 
        "candidateName": "Not Assigned", 
        "createdAt": datetime.utcnow()
    })
    return jsonify({"status": "Success"})


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
                    "score": float(score)
                })

        results = sorted(results, key=lambda x: x['score'], reverse=True)
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- EXPERT ASSESSMENT LOGGING ROUTE ---
@app.route('/api/assessments', methods=['POST'])
def save_assessment():
    try:
        data = request.get_json()
        assessments_col.insert_one({
            "expert_name": data.get('expert_name'), 
            "candidate_name": data.get('candidate_name'),
            "score": data.get('score'), 
            "remarks": data.get('remarks', ''), 
            "timestamp": datetime.utcnow()
        })
        return jsonify({"status": "Success", "message": "Assessment recorded securely."})
    except Exception as e:
        return jsonify({"status": "Error", "message": "Failed to record assessment."}), 500


# --- RETRIEVE EXPERT ASSESSMENT ROUTE ---
@app.route('/api/assessments/<candidate_name>', methods=['GET'])
def get_candidate_assessment(candidate_name):
    try:
        assessment = assessments_col.find_one(
            {"candidate_name": candidate_name}, 
            sort=[("timestamp", -1)], 
            projection={"_id": 0}
        )
        if assessment:
            return jsonify({"status": "Success", "data": assessment})
            
        return jsonify({"status": "Pending", "message": "No assessment found yet."}), 404
    except Exception as e:
        return jsonify({"status": "Error", "message": "Failed to fetch assessment."}), 500


# ==========================================
# 4. RUN THE SERVER
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)