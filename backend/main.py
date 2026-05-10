from flask import Flask, request, jsonify, send_file
from flask_cors import CORS  # Standard for React integration
from pymongo import MongoClient
from gridfs import GridFS
from bson.objectid import ObjectId
import pandas as pd
import os
import io
import re  
from thefuzz import process, fuzz  # Added for Advanced Fuzzy NLP Matching
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 

# Import custom AI logic from the src folder
from src.text_processor import preprocess_text
from src.relevance_engine import calculate_similarity

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================
CORS(app)

# File Validation Settings
ALLOWED_EXTENSIONS = {'pdf', 'xlsx', 'xls', 'docx', 'png', 'jpg'}

def allowed_file(filename):
    """Checks if the uploaded file has a supported extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ==========================================
# 2. DATABASE CONNECTION & GRIDFS BUCKET
# ==========================================
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("\n" + "="*50)
    print("CRITICAL ERROR: MONGO_URI is missing from .env!")
    print("="*50 + "\n")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client['NexusRAC']

# Define Data Collections
experts_col = db['experts']
users_col = db['users']
interviews_col = db['interviews']
vault_col = db['vault']             # Metadata for general supporting files
assessments_col = db['assessments'] # Stores technical evaluation scores
resumes_col = db['resumes']         # Specifically for Primary Candidate Resumes
notifications_col = db['notifications'] # System Alerts, Broadcasts, and Invites
schedules_col = db['schedules']     # Candidate-Expert Appointment Handshakes

# Initialize MongoDB GridFS Bucket (Stores binary file data directly in the DB)
fs = GridFS(db)


# ==========================================
# 3. SYSTEM & AUTHENTICATION ROUTES
# ==========================================

@app.route('/')
def index():
    return jsonify({
        "status": "Success", 
        "message": "Aegis RAC Flask Backend Running!",
        "version": "4.5.0 (Full Integration)"
    })


@app.route('/api/health_check', methods=['GET'])
def health_check():
    """System Diagnostics: Verify DB handshake and API health"""
    try:
        client.admin.command('ping')
        return jsonify({"status": "Optimal", "db_status": "Connected"})
    except Exception as e:
        return jsonify({"status": "Critical", "db_status": "Disconnected", "error": str(e)}), 500


@app.route('/api/signup', methods=['POST'])
def register_user():
    """Secure Registration: Checks for existing users and hashes passwords"""
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


@app.route('/api/login', methods=['POST'])
def login_user():
    """Secure Auth: Verify user identity against hashed database records"""
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


# ==========================================
# 4. NOTIFICATION MATRIX ROUTES
# ==========================================

@app.route('/api/notifications', methods=['POST'])
def send_notification():
    """Global Signaling: Sends an alert to a specific node or 'ALL' nodes with Quick Links"""
    try:
        data = request.json
        notifications_col.insert_one({
            "recipient": data.get("recipient"), 
            "sender": data.get("sender", "System"),
            "message": data.get("message"),
            "type": data.get("type", "info"),
            "actionTab": data.get("actionTab", "overview"), # Tells frontend where to redirect
            "read": False,
            "createdAt": datetime.utcnow()
        })
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/notifications/<username>', methods=['GET'])
def get_notifications(username):
    """Retrieve Signals: Fetches 20 most recent alerts for the logged-in user"""
    try:
        nots = list(notifications_col.find({
            "$or": [{"recipient": username}, {"recipient": "ALL"}]
        }).sort("createdAt", -1).limit(20))
        
        for n in nots:
            n["_id"] = str(n["_id"])
        return jsonify(nots)
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/notifications/read/<notif_id>', methods=['PUT'])
def mark_notification_read(notif_id):
    """Acknowledge Signal: Marks a notification as viewed"""
    try:
        notifications_col.update_one({"_id": ObjectId(notif_id)}, {"$set": {"read": True}})
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


# ==========================================
# 5. SCHEDULING HANDSHAKE ROUTES
# ==========================================

@app.route('/api/schedules/<username>', methods=['GET'])
def get_schedules(username):
    """Fetch Proposed Slots: Returns appointments involving the specific node"""
    try:
        user_schedules = list(schedules_col.find({
            "$or": [{"candidate": username}, {"expert": username}]
        }).sort("timestamp", -1))
        for s in user_schedules:
            s["_id"] = str(s["_id"])
        return jsonify(user_schedules)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/schedules', methods=['POST'])
def handle_schedule():
    """Handshake Logic: Handles new slot proposals, counter-offers, and confirmations"""
    try:
        data = request.json
        # If it's an update to an existing schedule (Accepting/Countering)
        if "id" in data:
            schedules_col.update_one(
                {"_id": ObjectId(data["id"])},
                {"$set": {
                    "dateTime": data["dateTime"],
                    "status": data["status"], # 'Confirmed', 'Pending'
                    "lastModifiedBy": data["sender"]
                }}
            )
        else:
            # Create a brand new request from the candidate or expert
            schedules_col.insert_one({
                "candidate": data["candidate"],
                "expert": data["expert"],
                "dateTime": data["dateTime"], # ISO string format
                "status": "Pending",
                "proposedBy": data["sender"],
                "timestamp": datetime.utcnow()
            })
        return jsonify({"status": "Success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# 6. GRIDFS VAULT & RESUME MANAGEMENT
# ==========================================

@app.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    """Primary Resume Sync: Direct binary upload to GridFS bucket"""
    try:
        if 'file' not in request.files: return jsonify({"status": "Error", "message": "No file part"}), 400
        file = request.files['file']
        username = request.form.get('username') 

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.seek(0, os.SEEK_END); file_length = file.tell(); file.seek(0)
            
            file_id = fs.put(file, filename=filename, metadata={"username": username, "type": "resume"}, content_type=file.content_type)

            resumes_col.insert_one({
                "username": username, "filename": filename, "gridfs_id": file_id,
                "upload_date": datetime.utcnow(), "size": f"{file_length / 1024:.2f} KB"
            })
            return jsonify({"status": "Success", "filename": filename})
        return jsonify({"status": "Error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/resumes/<username>', methods=['GET'])
def get_user_resumes(username):
    """Resume Retrieval: Fetches all versions of the candidate's primary resume"""
    try:
        user_resumes = list(resumes_col.find({"username": username}).sort("upload_date", -1))
        for r in user_resumes:
            r['_id'] = str(r['_id'])
            r['gridfs_id'] = str(r.get('gridfs_id', r['_id'])) 
        return jsonify(user_resumes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/resumes/delete/<file_id>', methods=['DELETE'])
def delete_resume(file_id):
    """Resume Purge: Permanently deletes a file from GridFS and metadata collection"""
    try:
        try: fs.delete(ObjectId(file_id))
        except: pass 
        resumes_col.delete_one({"$or": [{"gridfs_id": ObjectId(file_id)}, {"_id": ObjectId(file_id)}]})
        return jsonify({"status": "Success", "message": "Resume deleted securely."})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Supporting Data Vault: Uploads technical evidence/docs to GridFS"""
    try:
        if 'file' not in request.files: return jsonify({"status": "Error", "message": "No file part"}), 400
        file = request.files['file']
        username = request.form.get('username') 

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.seek(0, os.SEEK_END); file_length = file.tell(); file.seek(0)
            
            file_id = fs.put(file, filename=filename, metadata={"username": username}, content_type=file.content_type)

            vault_col.insert_one({
                "username": username, "filename": filename, "gridfs_id": file_id,
                "upload_date": datetime.utcnow(), "size": f"{file_length / 1024:.2f} KB"
            })
            return jsonify({"status": "Success", "filename": filename})
        return jsonify({"status": "Error", "message": "File type not allowed"}), 400
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/vault/<username>', methods=['GET'])
def get_vault_files(username):
    """Vault Retrieval: Fetches a list of all technical docs in the user's secure vault"""
    try:
        user_files = list(vault_col.find({"username": username}))
        for f in user_files:
            f['_id'] = str(f['_id'])
            f['gridfs_id'] = str(f.get('gridfs_id', f['_id'])) 
        return jsonify(user_files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/vault/view/<file_id>', methods=['GET'])
def view_file(file_id):
    """Secure Document Viewer: Streams GridFS binary data to the browser tab"""
    try:
        grid_out = fs.get(ObjectId(file_id))
        return send_file(
            io.BytesIO(grid_out.read()), 
            mimetype=grid_out.content_type or 'application/octet-stream', 
            download_name=grid_out.filename, 
            as_attachment=False
        )
    except Exception as e:
        return jsonify({"error": "File not found or corrupted. May be a legacy file."}), 404


@app.route('/api/vault/delete/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Vault Deletion: Safely removes file and its associated metadata"""
    try:
        try: fs.delete(ObjectId(file_id))
        except: pass 
        vault_col.delete_one({"$or": [{"gridfs_id": ObjectId(file_id)}, {"_id": ObjectId(file_id)}]})
        return jsonify({"status": "Success", "message": "File deleted securely."})
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


# ==========================================
# 7. EXPERT & AI MATCHING ENGINE
# ==========================================

@app.route('/api/expert/get_resume/<candidate_name>', methods=['GET'])
def expert_get_candidate_resume(candidate_name):
    """Expert Sync Helper: Retrieves the current resume ID for a candidate in the queue"""
    try:
        # Look for the newest primary resume for this candidate
        resume = resumes_col.find_one(
            {"username": candidate_name}, 
            sort=[("upload_date", -1)]
        )
        if resume:
            return jsonify({"status": "Success", "gridfs_id": str(resume['gridfs_id'])})
        return jsonify({"status": "None", "message": "No resume uploaded"}), 404
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/match', methods=['POST'])
def match_expert():
    """Neural Engine: Calculates cosine similarity between candidate skills and expert profiles"""
    data = request.get_json()
    candidate_skills = data.get('skills', '')
    
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


@app.route('/api/audit', methods=['POST'])
def audit_profile():
    """AI Auditor: Generates logic-based feedback for technical profiles"""
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


# ==========================================
# 8. BOARD & ASSESSMENT LOGGING
# ==========================================

@app.route('/api/create_board', methods=['POST'])
def create_board():
    """Root Authority: Defines a new interview board subject and date"""
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


@app.route('/api/boards', methods=['GET'])
def get_boards():
    """Fetch all active interview boards"""
    try:
        boards = list(interviews_col.find().sort("createdAt", -1))
        for b in boards:
            b["_id"] = str(b["_id"])
        return jsonify(boards)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/assessments', methods=['POST'])
def save_assessment():
    """Expert Evaluation: Records technical performance scores for a candidate"""
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
        return jsonify({"status": "Error", "message": str(e)}), 500


@app.route('/api/assessments/<candidate_name>', methods=['GET'])
def get_candidate_assessment(candidate_name):
    """Official Transcript: Fetches the evaluation results for the logged-in candidate"""
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
        return jsonify({"status": "Error", "message": str(e)}), 500


# ==========================================
# 9. ADMIN DASHBOARD ANALYTICS ROUTES
# ==========================================

@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    """Admin Route: Fetches all registered nodes (users) from the database."""
    try:
        users = list(users_col.find({}, {"password": 0})) # Security: Exclude passwords
        formatted_users = []
        for u in users:
            formatted_users.append({
                "id": str(u["_id"]),
                "name": u.get("username", "Unknown Node"),
                "role": u.get("role", "Candidate"),
                "status": "Active", 
                "lastLogin": u.get("createdAt", datetime.utcnow()).strftime("%b %d, %Y")
            })
        return jsonify(formatted_users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/admin/vault_logs', methods=['GET'])
def get_all_vault_logs():
    """Admin Route: Fetches a combined ledger of all resumes and vault uploads."""
    try:
        resumes = list(resumes_col.find().sort("upload_date", -1).limit(25))
        vault_files = list(vault_col.find().sort("upload_date", -1).limit(25))
        
        logs = []
        for r in resumes:
            logs.append({
                "id": str(r["_id"]),
                "user": r.get("username", "Unknown"),
                "file": r.get("filename", "Unknown"),
                "size": r.get("size", "N/A"),
                "type": "RESUME",
                "date": r.get("upload_date", datetime.utcnow()).strftime("%Y-%m-%d %H:%M")
            })
            
        for v in vault_files:
            logs.append({
                "id": str(v["_id"]),
                "user": v.get("username", "Unknown"),
                "file": v.get("filename", "Unknown"),
                "size": v.get("size", "N/A"),
                "type": "VAULT",
                "date": v.get("upload_date", datetime.utcnow()).strftime("%Y-%m-%d %H:%M")
            })
        
        # Sort the combined list chronologically
        logs.sort(key=lambda x: x["date"], reverse=True)
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 10. AEGIS AI CHATBOT ROUTE (V4 - FUZZY MATCHING + ROLE AWARENESS)
# ==========================================

# Define the Knowledge Base patterns mapped to Intent Names
AEGIS_INTENTS = {
    "greeting": ['hello', 'hi', 'hey', 'greetings', 'morning', 'howdy'],
    "gratitude": ['thank you', 'thanks', 'appreciate it', 'awesome', 'great', 'good job'],
    "goodbye": ['bye', 'goodbye', 'exit', 'quit', 'leave', 'sign off'],
    "help": ['help', 'support', 'guide', 'assist', 'confused', 'how do i use this', 'what can you do', 'options'],
    "scheduling": ['schedule an interview', 'book an expert', 'schedule a sync', 'find a match time', 'appointment', 'how do i schedule'],
    "matching": ['how to match', 'find expert', 'run engine', 'get expert', 'algorithm recommendation', 'start match'],
    "vault": ['upload resume', 'data vault', 'add document', 'upload pdf', 'how to upload'],
    "assessment": ['check score', 'view assessment', 'evaluation result', 'grade', 'performance transcript'],
    "status": ['system status', 'server health', 'is it online', 'capacity', 'is the site down'],
    "create_identity": ['give me steps to create an identity', 'how do i create an identity', 'how to sign up', 'register account', 'create account', 'new user setup'],
    "what_is_aegis": ['what is aegis', 'explain the rac system', 'how does this website work', 'what do you do', 'what is this site']
}

@app.route('/api/chat', methods=['POST'])
def chatbot_response():
    """Advanced AI Assistant using TheFuzz NLP matching + Dynamic Role Awareness."""
    data = request.get_json()
    
    raw_msg = data.get('message', '').lower()
    user_msg = re.sub(r'[^\w\s]', '', raw_msg) # Clean input
    role = data.get('role', 'Guest')

    # 1. Flatten patterns for TheFuzz searching
    all_patterns = []
    pattern_to_intent = {}
    
    for intent_name, patterns in AEGIS_INTENTS.items():
        for pattern in patterns:
            all_patterns.append(pattern)
            pattern_to_intent[pattern] = intent_name

    # 2. Use TheFuzz to find the closest matching semantic pattern
    best_match = process.extractOne(user_msg, all_patterns, scorer=fuzz.token_set_ratio)
    
    # 3. Determine Winning Intent (Requires > 65% Confidence Score)
    if best_match and best_match[1] > 65:
        best_intent = pattern_to_intent[best_match[0]]
    else:
        best_intent = "unknown"

    # 4. Generate Dynamic Responses based on Winning Intent & User Role
    reply = ""

    if best_intent == "greeting":
        if role == 'Guest':
            reply = "Greetings. I am Aegis AI. Please log in or create an identity to access the Aegis matrix."
        else:
            reply = f"Hello, {role}. All systems are nominal. How can I assist your workflow today?"

    elif best_intent == "gratitude":
        reply = "You are welcome. Aegis AI is always here to assist the Aegis network."

    elif best_intent == "goodbye":
        reply = "Session terminated. Safe travels through the matrix."

    elif best_intent == "help":
        if role == 'Candidate':
            reply = "I can help you with: 1) Uploading to your Vault. 2) Running the Match Engine. 3) Scheduling an Expert sync. What do you need?"
        elif role == 'Expert':
            reply = "I can help you with: 1) Checking your Live Queue. 2) Managing your Schedule. 3) Logging Assessments. What do you need?"
        else:
            reply = "I am the Aegis AI. I assist with matching, scheduling, and data vaults. Please specify your query."

    elif best_intent == "scheduling":
        if role == 'Candidate':
            reply = "To schedule, go to the 'Schedule' tab. Propose a time, and wait for the Expert to Confirm before initializing the sync."
        elif role == 'Expert':
            reply = "Navigate to your 'Schedule' tab. You can Accept pending requests or suggest a Counter-proposal."
        else:
            reply = "Scheduling is handled peer-to-peer via the Node Availability Manager in your dashboard."

    elif best_intent == "matching":
        if role == 'Candidate':
            reply = "Navigate to the 'Match Engine' tab and click 'Run AI Sequence' to find your ideal expert based on your Vault skills."
        elif role == 'Expert':
            reply = "Candidates are automatically routed to your 'Live Queue' when the neural engine matches their skills to your domain."
        else:
            reply = "The Neural Match Engine uses Cosine Similarity to mathematically pair candidate skill vectors with expert domains."

    elif best_intent == "vault":
        reply = "Navigate to the 'Data Vault' tab. You can securely upload PDFs or DOCX files. They will be encrypted directly into our GridFS database."

    elif best_intent == "assessment":
        if role == 'Expert':
            reply = "You can log official candidate scores in the 'Assessments' module. Ensure you follow all RAC evaluation guidelines."
        elif role == 'Candidate':
            reply = "Once an interview concludes, your expert will log your score. You can view your official transcript in the 'Assessments' tab."
        else:
            reply = "Assessments are logged securely into the MongoDB matrix by verified experts only."

    elif best_intent == "status":
        reply = "The Aegis RAC system and Neural Match Engine are currently operating at 100% optimal capacity."

    elif best_intent == "create_identity":
        reply = "To create a verified identity in the Aegis Matrix:\n\n1. Click 'Get Access' in the navigation bar.\n2. Select your node type ('Candidate' or 'Expert').\n3. Input your secure credentials.\n4. Initialize your Skill Vector to complete the process."

    elif best_intent == "what_is_aegis":
        reply = "The Aegis RAC System is an intelligent bridge between technical candidates and domain experts. We use neural precision to validate candidate skills and automatically schedule them with the most relevant interview board."

    elif best_intent == "unknown":
        if role == 'Candidate':
            reply = "I didn't quite catch that. Try asking me about 'matching with an expert', 'scheduling an interview', or 'uploading a resume'."
        elif role == 'Expert':
            reply = "I didn't quite catch that. Try asking me about 'evaluating a candidate', 'checking my schedule', or 'my live queue'."
        else:
            reply = "I am the Aegis AI. I currently do not have data on that query. Please ask me about creating an identity, scheduling a sync, or the Aegis RAC system."

    return jsonify({"response": reply})


# ==========================================
# TEMPORARY ADMIN SCRIPT: SEED EXPERT ACCOUNTS
# ==========================================
@app.route('/api/seed_experts', methods=['GET'])
def seed_expert_accounts():
    """Loops through all experts and creates a secure login account for them."""
    try:
        # 1. Fetch all experts from the database
        experts = list(experts_col.find())
        created_count = 0
        skipped_count = 0
        
        for exp in experts:
            # 2. Get their name (handling different possible database column names)
            name = exp.get('ExpertName') or exp.get('name')
            if not name:
                continue
            
            # 3. Generate a clean, random email based on their name
            # e.g., "Dr. Sarah Chen" -> "dr.sarah.chen@aegis.edu.in"
            clean_name = name.lower().replace(' ', '.')
            email = f"{clean_name}@aegis.edu.in"
            
            # 4. Check if they already have an account to prevent duplicates
            existing = users_col.find_one({"email": email})
            if existing:
                skipped_count += 1
                continue
            
            # 5. Hash the universal password "Indore"
            hashed_password = generate_password_hash("Indore", method='pbkdf2:sha256')
            
            # 6. Save them into the secure users collection
            users_col.insert_one({
                "username": name,
                "email": email,
                "password": hashed_password,
                "role": "Expert",
                "skills": exp.get('ExpertSubject') or exp.get('domain', 'N/A'),
                "createdAt": datetime.utcnow()
            })
            created_count += 1
            
        return jsonify({
            "status": "Success", 
            "message": f"Created {created_count} new Expert accounts! Skipped {skipped_count} existing.",
            "universal_password": "Indore"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==========================================
# 11. RUN ENGINE
# ==========================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)