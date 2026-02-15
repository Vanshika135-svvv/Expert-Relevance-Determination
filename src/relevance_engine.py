from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match(candidate_text, expert_list):
    # We combine the candidate and all experts into one list for the AI
    all_profiles = [candidate_text] + expert_list
    
    # Initialize TF-IDF (Turn text into numerical vectors)
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_profiles)
    
    # Compare Candidate (Index 0) with all Experts (Index 1 onwards)
    scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    return scores[0]