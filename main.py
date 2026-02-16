from flask import Flask, render_template, request
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import string
import os

app = Flask(__name__)

def clean_text(text):
    if not isinstance(text, str): return ""
    text = text.lower().translate(str.maketrans('', '', string.punctuation))
    stop_words = ["and", "the", "is", "in", "for", "with", "on", "a", "of"]
    return " ".join([w for w in text.split() if w not in stop_words])

# --- DYNAMIC FILE LOADING ---
base_path = os.path.dirname(os.path.abspath(__file__))
cand_path = os.path.join(base_path, 'data', 'candidate_testin g_data (2).csv')
exp_path = os.path.join(base_path, 'data', 'Expert_testing_data.csv')

try:
    cand_df = pd.read_csv(cand_path)
    exp_df = pd.read_csv(exp_path)
    cand_df['Profile'] = cand_df['Course'].astype(str) + " " + cand_df['Primary_Skill'].astype(str)
    exp_df['Profile'] = exp_df['ExpertSubject'].astype(str)
    print("✅ System Ready: Data Loaded.")
except Exception as e:
    print(f"❌ CRITICAL ERROR: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    candidate_name = request.form.get('candidate_name')
    candidate_row = cand_df[cand_df['Name'].str.contains(candidate_name, case=False, na=False)]
    
    if candidate_row.empty:
        return render_template('index.html', error=f"No matches for '{candidate_name}'")

    tfidf = TfidfVectorizer()
    clean_cand = clean_text(candidate_row.iloc[0]['Profile'])
    clean_experts = exp_df['Profile'].apply(clean_text).tolist()
    
    all_docs = [clean_cand] + clean_experts
    tfidf_matrix = tfidf.fit_transform(all_docs)
    scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    results = exp_df.copy()
    results['Match_Score'] = (scores * 100).round(2)
    max_exp = exp_df['Experience (Years)'].max()
    results['Exp_Weight'] = (exp_df['Experience (Years)'] / max_exp) * 100
    results['Relevancy_Score'] = (results['Match_Score'] * 0.7 + results['Exp_Weight'] * 0.3).round(2)
    
    ranked_experts = results.sort_values(by='Relevancy_Score', ascending=False).head(5)
    experts_list = ranked_experts.to_dict('records')
    
    return render_template('index.html', candidate=candidate_name, experts=experts_list)

if __name__ == '__main__':
    app.run(debug=True)