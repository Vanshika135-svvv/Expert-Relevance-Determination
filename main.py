from flask import Flask, render_template, request
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import string
import os

app = Flask(__name__)

# --- STEP 1: TEXT CLEANING LOGIC ---
def clean_text(text):
    if not isinstance(text, str): 
        return ""
    # Convert to lowercase and remove punctuation
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    # Remove common words that don't help in matching
    stop_words = ["and", "the", "is", "in", "for", "with", "on", "a", "of", "to"]
    return " ".join([w for w in text.split() if w not in stop_words])

# --- STEP 2: LOAD DATA GLOBALLY ---
# We load these once so the website is fast
try:
    # Get the current folder path to avoid "File Not Found" errors
    base_path = os.path.dirname(__file__)
    cand_path = os.path.join(base_path, 'data', 'candidate_testing_data (2).csv')
    exp_path = os.path.join(base_path, 'data', 'Expert_testing_data.csv')

    cand_df = pd.read_csv(cand_path)
    exp_df = pd.read_csv(exp_path)
    
    # Prepare Profiles for the AI to read
    # Candidate Profile = Course + Skill
    cand_df['Profile'] = cand_df['Course'].astype(str) + " " + cand_df['Primary_Skill'].astype(str)
    # Expert Profile = Subject
    exp_df['Profile'] = exp_df['ExpertSubject'].astype(str)
    
    print("✅ Successfully loaded CSV files!")
except Exception as e:
    print(f"❌ Error loading CSV files: {e}")

# --- STEP 3: WEB ROUTES ---

@app.route('/')
def home():
    # This loads the initial search page
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    # This runs when you click "Match Expert"
    candidate_name = request.form.get('candidate_name')
    
    # 1. Find the specific candidate in your data
    candidate_row = cand_df[cand_df['Name'] == candidate_name]
    
    if candidate_row.empty:
        return render_template('index.html', error=f"Candidate '{candidate_name}' not found!")

    # 2. AI Matching Logic (TF-IDF + Cosine Similarity)
    tfidf = TfidfVectorizer()
    clean_cand = clean_text(candidate_row.iloc[0]['Profile'])
    clean_experts = exp_df['Profile'].apply(clean_text).tolist()
    
    # Combine candidate profile with all expert profiles
    all_docs = [clean_cand] + clean_experts
    tfidf_matrix = tfidf.fit_transform(all_docs)
    
    # Calculate scores (Index 0 is candidate, the rest are experts)
    scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # 3. Build the Results Table
    results = exp_df.copy()
    results['Match_Score'] = (scores * 100).round(2)
    
    # 4. Final Relevancy (70% Skill Match + 30% Experience)
    max_exp = exp_df['Experience (Years)'].max()
    results['Exp_Weight'] = (exp_df['Experience (Years)'] / max_exp) * 100
    results['Relevancy_Score'] = (results['Match_Score'] * 0.7 + results['Exp_Weight'] * 0.3).round(2)
    
    # Sort: Best match at the top
    ranked_experts = results.sort_values(by='Relevancy_Score', ascending=False).head(5)
    
    # Convert data for the HTML to display
    experts_list = ranked_experts.to_dict('records')
    
    return render_template('index.html', candidate=candidate_name, experts=experts_list)

if __name__ == '__main__':
    # Run the website locally
    app.run(debug=True)